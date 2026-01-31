import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

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

    // --- AI STRATEGY (FALLBACK CHAIN) ---

    // 1. OpenRouter Models (Priority reasoning Support)
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openrouterApiKey) {
      const models = [
        { id: "openai/gpt-oss-120b:free", name: "GPT-OSS-120B" },
        { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid LFM" },
      ];

      for (const model of models) {
        try {
          console.log(`EXPLAIN: Trying OpenRouter (${model.name})...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: [{ role: "user", content: prompt }],
            // @ts-ignore
            reasoning: { enabled: true },
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

    // 2. Gemini Fallback
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("EXPLAIN: Trying Gemini Fallback...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite-preview-02-05",
        });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          return NextResponse.json({
            explanation: responseText,
            _provider: "gemini",
          });
        }
      } catch (e: any) {
        console.warn("Gemini explain fallback failed:", e.message);
      }
    }

    // 3. Groq Fallback
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        console.log("EXPLAIN: Trying Groq Fallback...");
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          return NextResponse.json({
            explanation: content,
            _provider: "groq",
          });
        }
      } catch (e: any) {
        console.warn("Groq explain fallback failed:", e.message);
      }
    }

    // Deep fallback
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return NextResponse.json({
          explanation: result.response.text(),
          _provider: "gemini-flash",
        });
      } catch (e) {
        console.warn("Deep fallback failed.");
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
