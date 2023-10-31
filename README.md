# 🦜️🔗 Chat over SQL

This app demonstrates how to query a SQL database using natural language.

It queries a [Neon DB](https://neon.tech/)-hosted instance of the popular demo Chinook database using [LangChain.js](https://js.langchain.com/) and OpenAI's `gpt-3.5-turbo` model to generate SQL queries.

You can watch the accompanying [Neon DB Developer Days talk here](https://www.loom.com/share/d3af5d50b82c44fd8ced3b9b5244bcb1?sid=e6945413-f68e-423c-b170-7d351d2d6119) to learn more about the prompt and chain, or check out a [live Vercel deployment here](https://langchain-chat-sql.vercel.app).

## Setup

First, you'll need to create an empty [Neon DB instance](https://neon.tech/).

Using your credentials, run the following commands to bootstrap the DB and a readonly user that the LLM will use to run generated queries:

```sql
psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -f bootstrap.sql

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "CREATE ROLE llm WITH LOGIN PASSWORD '<YOUR_PASSWORD>';"

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "GRANT CONNECT ON DATABASE <DB_NAME> TO llm;"

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO llm;"
```

You can modify the last step to only give read access to certain tables, as well as allow insert/update access
to specific tables, if desired.

Next, copy the `.env.example` file to `.env.local` and populate your `OPENAI_API_KEY` and Neon connection strings. To enable
tracing, you can enter your [LangSmith](https://smith.langchain.com/) keys as well.

Finally, run `yarn` to install the required dependencies.

## Usage

Run `yarn dev` to start this app locally.

The database simulates a media store and contains information on employees, customers, records, and transactions. You can learn more about it in [the GitHub repo](https://github.com/lerocha/chinook-database).

Here are some traces for example queries you can ask:

- `Who works here?`

https://smith.langchain.com/public/6d9e466d-a272-4dae-89b6-56e0686fc652/r

- `How many customers are from Germany?`

https://smith.langchain.com/public/b9c83439-e12c-4ca1-97b1-7a71ba6a8539/r

## Thank you!

Check out the following links for more:

- Neon DB: https://neon.tech/
- LangChainJS: https://github.com/langchain-ai/langchainjs
- LangSmith: https://smith.langchain.com/
- Chinook DB: https://github.com/lerocha/chinook-database
- Accompanying talk: https://www.loom.com/share/d3af5d50b82c44fd8ced3b9b5244bcb1?sid=e6945413-f68e-423c-b170-7d351d2d6119
