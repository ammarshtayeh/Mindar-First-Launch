import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn("OPENROUTER_API_KEY is not set in environment variables");
}

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey || "",
  defaultHeaders: {
    "HTTP-Referer": "https://mindar.tech", // Optional, replaces with your site URL
    "X-Title": "Mindar", // Optional, replaces with your site name
  },
});

// Helper for reasoning details extraction as per user snippet
export type ORChatMessage = OpenAI.Chat.Completions.ChatCompletionMessage & {
  reasoning_details?: unknown;
};
