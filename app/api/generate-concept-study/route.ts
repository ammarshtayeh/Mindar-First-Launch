import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeArabic } from "@/lib/text-normalizer";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { concept, excerpt, action, language = "ar" } = await req.json();

    if (!excerpt || !action) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 },
      );
    }

    const isArabic =
      language.toLowerCase() === "ar" || language.toLowerCase() === "arabic";
    const prompt =
      action === "summary"
        ? `
        Target: Deep Summary of "${concept}"
        Excerpt: "${excerpt}"
        
        Task: Provide a detailed, surgical explanation of this specific concept BASED ONLY on the excerpt. 
        Focus on: Logic, technical definitions, and practical use-cases.
        Language: ${isArabic ? "Arabic" : "English"}
        Format: Bullet points. UNLESS the excerpt is too short, expand briefly on the general concept of ${concept} while staying grounded.
        Length: 80-150 words. Do NOT be vague.
        `
        : action === "quiz"
          ? `
        Target: Micro-Quiz for "${concept}"
        Excerpt: "${excerpt}"
        
        Task: Generate exactly 3 high-quality multiple-choice questions about ${concept} based on this excerpt.
        Language: ${isArabic ? "Arabic" : "English"}
        Output: JSON only. No extra text.
        RSVP Schema: { "questions": [{ "question": "str", "options": ["a","b","c","d"], "answer": "correct_option_str", "explanation": "str" }] }
        `
          : `
        Target: Flashcards for "${concept}"
        Excerpt: "${excerpt}"
        
        Task: Create 5 distinct flashcards (Front/Back) about ${concept} based on this excerpt.
        Language: ${isArabic ? "Arabic" : "English"}
        Output: JSON only. No extra text.
        RSVP Schema: { "cards": [{ "front": "str", "back": "str" }] }
        `;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    // --- 1. Try OpenRouter First (New Key) ---
    if (openrouterApiKey) {
      const orModels = [
        "google/gemma-2-9b-it:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-7b-instruct:free",
      ];
      for (const modelId of orModels) {
        try {
          console.log(`CONCEPT STUDY: Trying OR (${modelId})...`);
          const res = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openrouterApiKey}`,
              },
              body: JSON.stringify({
                model: modelId,
                messages: [{ role: "user", content: prompt }],
                response_format: {
                  type: action === "summary" ? "text" : "json_object",
                },
              }),
            },
          );
          if (res.ok) {
            const completion = await res.json();
            const content = completion.choices[0]?.message?.content;
            if (content) {
              console.log(`CONCEPT STUDY: Success with OR:${modelId}`);
              if (action === "summary")
                return NextResponse.json({ result: content });
              return NextResponse.json(
                JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content),
              );
            }
          }
        } catch (e) {
          console.warn(`CONCEPT STUDY: OR ${modelId} failed`, e);
        }
      }
    }

    // --- 2. Try Gemini Fallback ---
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const configs = [
        { id: "gemini-3.8-flash", version: "v1beta" },
        { id: "gemini-3.5-flash-lite", version: "v1beta" },
        { id: "gemini-2.5-flash-lite", version: "v1beta" },
      ];

      for (const config of configs) {
        try {
          console.log(`CONCEPT STUDY: Trying Gemini (${config.id})...`);
          const model = genAI.getGenerativeModel(
            {
              model: config.id,
              generationConfig: {
                temperature: 0.2,
                responseMimeType:
                  action === "summary" ? "text/plain" : "application/json",
              },
            },
            { apiVersion: config.version as any },
          );

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          if (action === "summary")
            return NextResponse.json({ result: responseText });
          return NextResponse.json(
            JSON.parse(responseText.match(/\{[\s\S]*\}/)?.[0] || responseText),
          );
        } catch (err: any) {
          console.warn(
            `CONCEPT STUDY: Gemini ${config.id} failed`,
            err.message,
          );
        }
      }
    }

    // --- 3. Try Groq Fallback ---
    if (
      groqApiKey &&
      (action === "quiz" || action === "flashcards" || action === "summary")
    ) {
      try {
        console.log("CONCEPT STUDY: Trying Groq...");
        const res = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
              model: "openai/gpt-oss-120b",
              response_format: {
                type: action === "summary" ? "text" : "json_object",
              },
            }),
          },
        );
        if (res.ok) {
          const completion = await res.json();
          const content = completion.choices[0]?.message?.content;
          if (content) {
            if (action === "summary")
              return NextResponse.json({ result: content });
            return NextResponse.json(
              JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || content),
            );
          }
        }
      } catch (e) {
        console.warn("CONCEPT STUDY: Groq failed", e);
      }
    }

    throw new Error("All AI providers failed for concept study");
  } catch (error: any) {
    console.error("Concept Study API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate study data", details: error.message },
      { status: 500 },
    );
  }
}
