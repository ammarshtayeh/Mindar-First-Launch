import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text, language = "ar" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const prompt = `
      You are a World-Class Education Planner.
      Your Goal: Create a multi-day STUDY ROADMAP based on the provided material.
      
      STRUCTURE:
      Return a JSON array of "milestones". Each milestone represents a study stage.
      
      Milestone Schema:
      {
        "id": string,
        "title": "Clear concise title",
        "description": "Short explanation of what to master here",
        "tasks": ["Task 1", "Task 2"],
        "difficulty": "Easy" | "Medium" | "Hard",
        "estimatedTime": "e.g., 2 hours"
      }
      
      RULES:
      1. Logic: Order milestones from foundational concepts to advanced application.
      2. Language: Use Modern Standard Arabic (Fusha) if language is 'ar'.
      3. Quantity: Generate 4-7 milestones.
      
      Material:
      ${text.substring(0, 30000)}
      
      RETURN RAW JSON ONLY.
    `;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    // --- AI STRATEGY (FALLBACK CHAIN) ---

    // 1. OpenRouter Models (Priority reasoning Support)
    if (openrouterApiKey) {
      const models = [
        { id: "openai/gpt-oss-120b:free", name: "GPT-OSS-120B" },
        { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid LFM" },
      ];

      for (const model of models) {
        try {
          console.log(`ROADMAP: Trying OpenRouter (${model.name})...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: [{ role: "user", content: prompt }],
            // @ts-ignore
            reasoning: { enabled: true },
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            const json = JSON.parse(
              content.match(/\[[\s\S]*\]/)?.[0] || content,
            );
            return NextResponse.json({
              milestones: json,
              _provider: `openrouter:${model.name}`,
            });
          }
        } catch (e: any) {
          console.warn(`OpenRouter Roadmap (${model.name}) failed:`, e.message);
          continue;
        }
      }
    }

    // 2. Gemini Fallback
    if (geminiApiKey) {
      try {
        console.log("ROADMAP: Trying Gemini Fallback...");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite-preview-02-05",
        });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          const json = JSON.parse(
            responseText.match(/\[[\s\S]*\]/)?.[0] || responseText,
          );
          return NextResponse.json({
            milestones: json,
            _provider: "gemini",
          });
        }
      } catch (e: any) {
        console.warn("Gemini roadmap fallback failed:", e.message);
      }
    }

    // 3. Groq Fallback
    if (groqKey) {
      try {
        console.log("ROADMAP: Trying Groq Fallback...");
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const json = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] || content);
          return NextResponse.json({
            milestones: json,
            _provider: "groq",
          });
        }
      } catch (e: any) {
        console.warn("Groq roadmap fallback failed:", e.message);
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
