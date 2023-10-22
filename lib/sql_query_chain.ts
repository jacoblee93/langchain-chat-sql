import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { RunnablePassthrough, RunnableSequence } from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";

import { encodingForModel } from "js-tiktoken";

import { db } from "./neon_db";

/**
 * Create the first prompt template used for getting the SQL query.
 * https://smith.langchain.com/hub/jacob/text-to-postgres-sql
 */
const queryGenerationPrompt =
  PromptTemplate.fromTemplate(`You are a Postgres expert. Given an input question, first create a syntactically correct Postgres query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most 5 results using the LIMIT clause as per Postgres. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: <Question here>
SQLQuery: <SQL Query to run>
SQLResult: <Result of the SQLQuery>
Answer: <Final answer here>

Only use the following tables:

{schema}

QUESTION: {question}
SQLQuery:`);

/**
 * Create the final prompt template which is tasked with getting the natural
 * language response to the SQL query.
 */
const finalResponsePrompt =
  PromptTemplate.fromTemplate(`Based on the table schema below, question, SQL query, and SQL response, write a natural language response:
------------
SCHEMA: {schema}
------------
QUESTION: {question}
------------
SQL QUERY: {query}
------------
SQL RESPONSE: {response}
------------
NATURAL LANGUAGE RESPONSE:`);

const enc = encodingForModel("gpt-3.5-turbo" as const);

export type SQLChainParams = {
  includesTables?: string[],
  encouragedWords?: string[],
  discouragedWords?: string[],
}

export async function createSqlChain({ 
  includesTables, 
  encouragedWords = [], 
  discouragedWords = []
}: SQLChainParams) {
  const encouragedTokens = enc.encode(encouragedWords.join(""));

  const discouragedTokens = enc.encode(discouragedWords.join(""));

  const positiveBias = encouragedTokens.reduce((logitBias: Record<number, number>, token) => {
    logitBias[token] = 5;
    return logitBias;
  }, {});

  const finalBias = discouragedTokens.reduce((logitBias: Record<number, number>, token) => {
    logitBias[token] = -100;
    return logitBias;
  }, positiveBias);

  const llm = new OpenAI({
    modelName: "gpt-3.5-turbo-instruct",
    logitBias: finalBias,
    temperature: 0.1,
  }).bind({ stop: ["\nSQLResult:"] });
  
  /**
   * Create a new RunnableSequence where we pipe the output from `db.getTableInfo()`
   * and the users question, into the prompt template, and then into the llm.
   * We're also applying a stop condition to the llm, so that it stops when it
   * sees the `\nSQLResult:` token.
   */
  const sqlQueryGeneratorChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      schema: async () => db.getTableInfo(includesTables),
    }),
    queryGenerationPrompt,
    llm,
    new StringOutputParser(),
  ]);

  /**
   * Create a new RunnableSequence where we pipe the output from the previous chain, the users question,
   * and the SQL query, into the prompt template, and then into the llm.
   * Using the result from the `sqlQueryGeneratorChain` we can run the SQL query.
   *
   * Lastly we're piping the result of the first chain (the outputted SQL query) so it is
   * logged along with the natural language response.
   */
  const finalChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      query: sqlQueryGeneratorChain,
    }),
    {
      schema: async () => db.getTableInfo(includesTables),
      question: (input) => input.question,
      query: (input) => input.query,
      response: (input) => db.run(input.query),
    },
    {
      result: finalResponsePrompt.pipe(llm).pipe(new StringOutputParser()),
      // Pipe the query through here unchanged so it gets logged alongside the result.
      sql: (previousStepResult) => previousStepResult.query,
    },
  ]);
  
  return finalChain;
}
