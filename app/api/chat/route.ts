import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

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

    // Try Gemini first
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite-preview-02-05",
        });
        const chat = model.startChat({
          history: history.map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          })),
        });
        const result = await model.generateContent([
          systemPrompt,
          ...history.map((h: any) => h.content),
          query,
        ]);
        const response = await result.response;
        return NextResponse.json({ response: response.text() });
      } catch (e) {
        console.error("Gemini Chat Error:", e);
      }
    }

    // Fallback to Groq
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: messages as any,
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
        });
        return NextResponse.json({
          response: completion.choices[0].message.content,
        });
      } catch (e) {
        console.error("Groq Chat Error:", e);
      }
    }

    return NextResponse.json(
      { error: "All AI providers failed" },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
