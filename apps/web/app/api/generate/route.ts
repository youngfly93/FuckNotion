import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const MODELS = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B (Free)",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("API Generate Request Body:", body);
    const { prompt, option, command, apiConfig, stream = true } = body;
    
    // Extract API configuration from apiConfig object or use individual fields
    const apiKey = apiConfig?.apiKey || body.apiKey || process.env.OPENAI_API_KEY;
    const baseUrl = apiConfig?.baseUrl || body.baseUrl || process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = apiConfig?.model || body.model || process.env.OPENAI_MODEL || MODELS[0].id;
    
    console.log("API Config extracted:", { 
      hasApiKey: !!apiKey, 
      baseUrl, 
      model, 
      apiConfigProvided: !!apiConfig,
      stream 
    });

    // Use the extracted values
    const apiKeyToUse = apiKey;
    const baseUrlToUse = baseUrl;
    const modelToUse = model;

    if (!apiKeyToUse) {
      return new Response(
        JSON.stringify({
          error: "No API key configured. Please add your API key in the settings page.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const openai = createOpenAI({
      apiKey: apiKeyToUse,
      baseURL: baseUrlToUse,
    });

    // Try each model in sequence until one succeeds
    let lastError: any;
    const modelsToTry = [modelToUse, ...MODELS.map(m => m.id).filter(id => id !== modelToUse)];

    for (const currentModel of modelsToTry) {
      try {
        console.log(`Attempting with model: ${currentModel}`);

        const messages: any[] = [
          {
            role: "system",
            content:
              "You are an AI writing assistant that continues existing text based on context. " +
              "Your task is to complete the current incomplete sentence or phrase in a natural and contextually appropriate way. " +
              "Focus on completing the immediate thought or idea, not starting new sentences. " +
              "If the text ends mid-word, complete that word first. If it ends mid-phrase, complete the phrase. " +
              "Keep your completion concise and natural, typically 2-10 words that flow seamlessly from the existing text. " +
              "Do not add punctuation at the end unless it naturally completes the sentence.",
          },
        ];

        // Add the appropriate user message based on the option
        if (option === "continue" || option === "autocomplete") {
          messages.push({
            role: "user",
            content: prompt,
          });
        } else if (option === "improve") {
          messages.push({
            role: "user",
            content: `The user has the following text: ${prompt}
            
Please rewrite it to be more clear, concise, and descriptive.`,
          });
        } else if (option === "shorter") {
          messages.push({
            role: "user",
            content: `The user has the following text: ${prompt}
            
Please rewrite it to be shorter.`,
          });
        } else if (option === "longer") {
          messages.push({
            role: "user",
            content: `The user has the following text: ${prompt}
            
Please rewrite it to be longer.`,
          });
        } else if (option === "fix") {
          messages.push({
            role: "user",
            content: `The user has the following text: ${prompt}
            
Please fix any grammar or spelling errors.`,
          });
        } else if (option === "zap") {
          messages.push({
            role: "user",
            content: `The user has the following text: ${prompt}
            
Please rewrite it to match this instruction: ${command}`,
          });
        }

        // Handle streaming vs non-streaming responses
        if (stream) {
          const result = await streamText({
            model: openai(currentModel),
            messages,
          });
          return result.toDataStreamResponse();
        } else {
          // Non-streaming response for autocomplete
          const result = await generateText({
            model: openai(currentModel),
            messages,
            maxTokens: body.maxTokens || 50,
          });
          
          // Return plain text response for autocomplete
          return new Response(result.text, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }
      } catch (error: any) {
        console.error(`Error with model ${currentModel}:`, error);
        lastError = error;
        
        // If it's a rate limit or quota error, try the next model
        if (error?.status === 429 || error?.status === 402 || error?.message?.includes("quota")) {
          continue;
        }
        
        // For other errors, break the loop
        break;
      }
    }

    // If all models failed, return the last error
    return new Response(
      JSON.stringify({
        error: lastError?.message || "Failed to generate text. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate API:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}