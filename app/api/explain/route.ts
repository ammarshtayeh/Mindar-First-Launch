import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import {
  GEMINI_MODELS,
  GROQ_MODELS,
  OPENROUTER_FREE_MODELS,
} from "@/lib/ai/models";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const {
      question,
      userAnswer,
      correctAnswer,
      context,
      language = "ar",
    } = await req.json();

    if (!question || !correctAnswer) {
      return NextResponse.json({ error: "Missing Data" }, { status: 400 });
    }

    const prompt = `
        You are a smart, friendly tutor. 
        A student made a mistake on this question:
        
        Question: "${question}"
        Student Answer (Wrong): "${userAnswer || "Skipped"}"
        Correct Answer: "${correctAnswer}"
        Context/Topic: "${context || "General"}"

        Task: Explain WHY the student's answer is wrong (if provided) and WHY the correct answer is right.
        Tone: Encouraging, short, and clear.
        Language: ${language === "ar" ? "Arabic" : "English"}
        Length: Max 2-3 sentences. No markdown, just plain text.
        `;

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      for (const modelId of [
        GEMINI_MODELS.primary,
        GEMINI_MODELS.lite,
        GEMINI_MODELS.fallback,
      ]) {
        try {
          console.log(`EXPLAIN: Trying Gemini ${modelId}...`);
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: modelId });
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          if (responseText) {
            return NextResponse.json({
              explanation: responseText,
              _provider: "gemini",
              _model: modelId,
            });
          }
        } catch (e: any) {
          console.warn(`Gemini explain ${modelId} failed:`, e.message);
        }
      }
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey });
      for (const modelId of [
        GROQ_MODELS.fast,
        GROQ_MODELS.primary,
        GROQ_MODELS.alt,
      ]) {
        try {
          console.log(`EXPLAIN: Trying Groq ${modelId}...`);
          const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: modelId,
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              explanation: content,
              _provider: "groq",
              _model: modelId,
            });
          }
        } catch (e: any) {
          console.warn(`Groq explain ${modelId} failed:`, e.message);
        }
      }
    }

    if (openrouterApiKey) {
      for (const model of OPENROUTER_FREE_MODELS.slice(0, 2)) {
        try {
          console.log(`EXPLAIN: Trying OpenRouter (${model.name})...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: [{ role: "user", content: prompt }],
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              explanation: content,
              _provider: `openrouter:${model.name}`,
            });
          }
        } catch (e: any) {
          console.warn(`OpenRouter explain (${model.name}) failed:`, e.message);
          continue;
        }
      }
    }

    return NextResponse.json(
      {
        error:
          "جميع مزودي الذكاء الاصطناعي فشلوا في الرد. تأكد من إعدادات الـ API Key.",
      },
      { status: 503 },
    );
  } catch (error: any) {
    console.error("Explain API Fatal Error:", error);
    return NextResponse.json(
      { error: "Failed to explain", details: error.message },
      { status: 500 },
    );
  }
}
