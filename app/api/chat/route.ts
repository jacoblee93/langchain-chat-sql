import { NextRequest, NextResponse } from "next/server";

import { createSqlChain } from "@/lib/sql_query_chain";

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question;

    const chain = await createSqlChain({});

    const result = await chain.invoke({ question });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
