import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import {
  GEMINI_MODELS,
  GROQ_MODELS,
  OPENROUTER_PRIORITY_MODELS,
} from "@/lib/ai/models";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text, query, history = [], language = "ar" } = await req.json();

    if (!text || !query) {
      return NextResponse.json(
        { error: "Missing text or query" },
        { status: 400 },
      );
    }

    const systemPrompt = `
      You are MINDAR AI, a helpful study assistant.
      Your Goal: Answer the student's questions based ONLY on the provided study material.
      
      RULES:
      1. If the answer is not in the text, say "I'm sorry, but this information is not covered in your material. Would you like to ask something else about it?" (in ${language === "ar" ? "Arabic Fusha" : "English"}).
      2. Keep responses concise, clear, and encouraging.
      3. Use formatting (bullet points, bold text) to make answers readable.
      4. Always respond in ${language === "ar" ? "Modern Standard Arabic (Fusha)" : "English"}.
      
      Study Material Context:
      ${text.substring(0, 30000)}
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: query },
    ];

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (geminiApiKey) {
      for (const modelId of [
        GEMINI_MODELS.primary,
        GEMINI_MODELS.lite,
        GEMINI_MODELS.fallback,
      ]) {
        try {
          console.log(`CHAT: Trying Gemini ${modelId}...`);
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: modelId });
          const result = await model.generateContent([
            systemPrompt,
            ...history.map((h: any) => h.content),
            query,
          ]);
          const responseText = result.response.text();
          if (responseText) {
            return NextResponse.json({
              response: responseText,
              _provider: "gemini",
              _model: modelId,
            });
          }
        } catch (e: any) {
          console.warn(`Gemini chat ${modelId} failed:`, e.message);
        }
      }
    }

    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey });
      for (const modelId of [
        GROQ_MODELS.primary,
        GROQ_MODELS.fast,
        GROQ_MODELS.alt,
      ]) {
        try {
          console.log(`CHAT: Trying Groq ${modelId}...`);
          const completion = await groq.chat.completions.create({
            messages: messages as any,
            model: modelId,
            temperature: 0.5,
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              response: content,
              _provider: "groq",
              _model: modelId,
            });
          }
        } catch (e: any) {
          console.warn(`Groq chat ${modelId} failed:`, e.message);
        }
      }
    }

    if (openrouterApiKey) {
      for (const model of OPENROUTER_PRIORITY_MODELS.slice(0, 2)) {
        try {
          console.log(`CHAT: Trying OpenRouter (${model.name})...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: messages as any,
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              response: content,
              _provider: `openrouter:${model.name}`,
            });
          }
        } catch (e: any) {
          console.warn(`OpenRouter Chat (${model.name}) failed:`, e.message);
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
    console.error("Chat API Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
