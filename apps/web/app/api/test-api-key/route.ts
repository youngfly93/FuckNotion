import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, baseUrl, model } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "API key is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: baseUrl || "https://openrouter.ai/api/v1",
    });

    // Test the API key with a simple request
    const result = await generateText({
      model: openai(model || "anthropic/claude-3.5-sonnet"),
      prompt: "Say 'API key is valid' in 5 words or less.",
      maxTokens: 10,
    });

    return new Response(
      JSON.stringify({ success: true, message: "API key is valid" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("API key test error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Failed to validate API key",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}