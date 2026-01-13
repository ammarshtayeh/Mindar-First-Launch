import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { question, userAnswer, correctAnswer, context, language = 'ar' } = await req.json();

        if (!question || !correctAnswer) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        const prompt = `
        You are a smart, friendly tutor. 
        A student made a mistake on this question:
        
        Question: "${question}"
        Student Answer (Wrong): "${userAnswer || 'Skipped'}"
        Correct Answer: "${correctAnswer}"
        Context/Topic: "${context || 'General'}"

        Task: Explain WHY the student's answer is wrong (if provided) and WHY the correct answer is right.
        Tone: Encouraging, short, and clear.
        Language: ${language === 'ar' ? 'Arabic' : 'English'}
        Length: Max 2-3 sentences. No markdown, just plain text.
        `;

        // Strategy: Try Gemini Flash Lite -> Groq -> Gemini Flash
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
                const result = await model.generateContent(prompt);
                return NextResponse.json({ explanation: result.response.text() });
            } catch (e) {
                console.warn("Gemini Flash Lite failed, trying fallback...");
            }
        }

        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
             try {
                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                });
                return NextResponse.json({ explanation: completion.choices[0]?.message?.content || "No explanation generated." });
            } catch (e) {
                console.warn("Groq failed.");
            }
        }

        // Deep fallback
        if (apiKey) {
             const genAI = new GoogleGenerativeAI(apiKey);
             const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
             const result = await model.generateContent(prompt);
             return NextResponse.json({ explanation: result.response.text() });
        }

        throw new Error("All AI providers failed");

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to explain", details: error.message }, { status: 500 });
    }
}
