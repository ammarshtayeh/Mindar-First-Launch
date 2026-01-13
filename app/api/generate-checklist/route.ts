import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, language: requestedLang = "ar", materialTitle = "Study Material" } = body;

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const prompt = `
            system: You are a professional study advisor and personal tutor.
            Your Goal: Analyze the provided study material and create a structured, actionable study checklist (To-Do list) to help the student master the content.

            CRITICAL RULES:
            1. **ACTIONABLE TASKS**: Every item must be a clear action (e.g., "Review pages 5-10", "Understand the concept of X", "Practice solving equations on Y").
            2. **PRIORITIZATION**: Assign a priority ('high', 'medium', 'low') based on how fundamental the concept is to the overall topic.
            3. **LANGUAGE MATCHING**: Output MUST be in the SAME LANGUAGE as the Source Text provided below. If the source is in Arabic, the response must be in Arabic. If English, use English.
            4. **STRICT JSON**: Return ONLY a valid JSON object matching the schema below.

            Material Title: ${materialTitle}
            
            Source Text: ${text.substring(0, 60000)}

            Return RAW JSON ONLY matching this Schema:
            {
                "materialTitle": "string",
                "items": [
                    {
                        "task": "string",
                        "description": "string (brief explanation or why this is important)",
                        "priority": "high" | "medium" | "low",
                        "relatedPages": [number],
                        "relatedTopics": ["string"]
                    }
                ]
            }
        `;

        const groqKey = process.env.GROQ_API_KEY;
        const geminiApiKey = process.env.GEMINI_API_KEY;

        // Try Gemini first as it's usually better for long context extraction
        let result = await tryGemini(geminiApiKey, "gemini-2.0-flash-lite-preview-02-05", prompt);
        
        if (!result) {
            console.log("Gemini failed for checklist, trying Groq fallback...");
            result = await tryGroq(groqKey, prompt);
        }

        if (!result) {
            throw new Error("All AI providers failed to generate checklist");
        }

        return result;

    } catch (error: any) {
        console.error("Checklist Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate study checklist", details: error.message }, { status: 500 });
    }
}

async function tryGemini(apiKey: string | undefined, modelId: string, prompt: string) {
    if (!apiKey) return null;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel(
            { model: modelId, generationConfig: { temperature: 0.3 } },
            { apiVersion: "v1beta" }
        );
        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        return NextResponse.json({ ...data, _provider: 'gemini' });
    } catch (e) {
        console.warn(`Gemini ${modelId} checklist attempt failed`);
        return null;
    }
}

async function tryGroq(apiKey: string | undefined, prompt: string) {
    if (!apiKey) return null;
    try {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt + "\n\nRETURN ONLY JSON" }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" }
        });
        const data = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json({ ...data, _provider: 'groq' });
    } catch (e) {
        console.warn("Groq checklist attempt failed");
        return null;
    }
}
