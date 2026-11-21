import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import {
  GEMINI_FALLBACK_CHAIN,
  GEMINI_MODELS,
  GROQ_MODELS,
} from "@/lib/ai/models";
import {
  normalizeLearningMode,
  learningModePromptBlock,
} from "@/lib/learning-mode";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      text,
      language = "ar",
      mode: requestedMode,
      materialTitle = "Study Material",
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const learningMode = normalizeLearningMode(requestedMode);
    const langLabel = language === "en" || language === "English" ? "English" : "Arabic";

    const prompt = `
You are creating a short Instagram-Reels style educational video script from study material.

GOAL: 30–60 second vertical educational reel.
You MUST return EXACTLY 5 scenes (not fewer).
Each scene must be punchy, clear, and speakable aloud.

RULES:
1. Ground EVERY claim ONLY in the source text. No hallucinations.
2. Total spoken duration target: about 40–50 seconds.
3. Each scene durationSec MUST be between 6 and 10.
4. Each scene narration: 1–2 short sentences (max ~22 words).
5. scene title: max 6 words, bold & readable on mobile.
6. Output language: ${langLabel}.
7. Return RAW JSON ONLY.
${learningModePromptBlock(learningMode, langLabel)}

Material title: ${materialTitle}
Source text:
${text.substring(0, 45000)}

Schema:
{
  "title": "string",
  "hook": "string (first line of the reel)",
  "totalDurationSec": 45,
  "scenes": [
    {
      "id": 1,
      "title": "string",
      "narration": "string",
      "durationSec": 8,
      "emoji": "string (one emoji)"
    }
  ]
}
`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    const geminiResult = await tryGemini(geminiApiKey, prompt);
    if (geminiResult) {
      return NextResponse.json({
        ...geminiResult,
        _provider: "gemini",
        _learningMode: learningMode,
      });
    }

    for (const config of GEMINI_FALLBACK_CHAIN) {
      const deep = await tryGemini(geminiApiKey, prompt, config.id);
      if (deep) {
        return NextResponse.json({
          ...deep,
          _provider: "gemini_fallback",
          _model: config.id,
          _learningMode: learningMode,
        });
      }
    }

    const groqResult = await tryGroq(groqKey, prompt);
    if (groqResult) {
      return NextResponse.json({
        ...groqResult,
        _provider: "groq",
        _learningMode: learningMode,
      });
    }

    return NextResponse.json(
      {
        error:
          language === "ar" || langLabel === "Arabic"
            ? "تعذر توليد الريل حالياً. حاول مرة أخرى."
            : "Could not generate the reel right now. Please try again.",
      },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Reel generation failed" },
      { status: 500 },
    );
  }
}

function parseReel(raw: string) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const data = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    throw new Error("Invalid reel schema");
  }
  data.scenes = data.scenes.slice(0, 6).map((s: any, i: number) => ({
    id: s.id || i + 1,
    title: String(s.title || `Scene ${i + 1}`),
    narration: String(s.narration || ""),
    durationSec: Math.max(5, Math.min(15, Number(s.durationSec) || 8)),
    emoji: String(s.emoji || "✨"),
  }));
  data.totalDurationSec =
    data.scenes.reduce((sum: number, s: any) => sum + s.durationSec, 0) || 45;
  data.title = String(data.title || "Educational Reel");
  data.hook = String(data.hook || data.scenes[0]?.title || "");
  return data;
}

async function tryGemini(
  apiKey: string | undefined,
  prompt: string,
  modelId: string = GEMINI_MODELS.primary,
) {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: { temperature: 0.4 },
    });
    const result = await model.generateContent(prompt);
    return parseReel(result.response.text());
  } catch (e: any) {
    console.warn(`Reel Gemini ${modelId} failed:`, e.message);
    return null;
  }
}

async function tryGroq(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;
  const groq = new Groq({ apiKey });
  for (const modelId of [GROQ_MODELS.fast, GROQ_MODELS.primary]) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt + "\n\nRETURN ONLY JSON" }],
        model: modelId,
        temperature: 0.4,
        response_format: { type: "json_object" },
      });
      return parseReel(completion.choices[0].message.content || "{}");
    } catch (e: any) {
      console.warn(`Reel Groq ${modelId} failed:`, e.message);
    }
  }
  return null;
}
