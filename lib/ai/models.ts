/** Current free/stable model IDs — keep in sync across all AI routes. */

export const GEMINI_MODELS = {
  primary: "gemini-3.8-flash",
  lite: "gemini-3.5-flash-lite",
  fallback: "gemini-2.5-flash-lite",
} as const;

export const GEMINI_FALLBACK_CHAIN = [
  { id: GEMINI_MODELS.primary, version: "v1beta" as const },
  { id: GEMINI_MODELS.lite, version: "v1beta" as const },
  { id: GEMINI_MODELS.fallback, version: "v1beta" as const },
];

export const GROQ_MODELS = {
  primary: "openai/gpt-oss-120b",
  fast: "openai/gpt-oss-20b",
  alt: "qwen/qwen3.8-27b",
} as const;

export const OPENROUTER_FREE_MODELS = [
  { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B" },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid LFM" },
] as const;

export const OPENROUTER_PRIORITY_MODELS = [
  ...OPENROUTER_FREE_MODELS,
] as const;
