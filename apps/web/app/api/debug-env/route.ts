import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  return new Response(
    JSON.stringify({
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIBaseURL: process.env.OPENAI_BASE_URL || "not set",
      openAIModel: process.env.OPENAI_MODEL || "not set",
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      hasKVUrl: !!process.env.KV_REST_API_URL,
      hasKVToken: !!process.env.KV_REST_API_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}