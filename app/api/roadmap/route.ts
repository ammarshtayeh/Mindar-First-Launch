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

    // Try Gemini
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite-preview-02-05",
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const json = JSON.parse(
          response.text().match(/\[[\s\S]*\]/)?.[0] || response.text(),
        );
        return NextResponse.json({ milestones: json });
      } catch (e) {
        console.error("Gemini Roadmap Error:", e);
      }
    }

    return NextResponse.json(
      { error: "AI Generation failed" },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
