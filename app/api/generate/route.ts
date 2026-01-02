import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation (Vercel limit)
export const dynamic = 'force-dynamic';



export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, numQuestions = 10, difficulty = "Medium", type = "multiple-choice", language: requestedLang, topic: requestedTopic } = body;
        
        // Default to detecting language from text if not specific
        const language = requestedLang || "SAME AS SOURCE TEXT";
        const topic = requestedTopic || "General Coverage";

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const prompt = `
            system: You are a strict and precise exam generator.
            Your Goal: Generate a quiz based ONLY on the provided text.
            
            CRITICAL RULES:
            1. **LANGUAGE MATCHING**: The quiz MUST be in the SAME language as the source text provided below. If the text is Arabic, the questions MUST be Arabic. If English, English. Do NOT translate unless explicitly asked.
            2. **ACCURACY IS PARAMOUNT**: Every answer MUST be explicitly found in the text. Do not use outside knowledge.
            3. **NO HALLUCINATIONS**: If a specific detail is not in the text, do not ask about it.
            
            - Target Language: ${language} (If "SAME AS SOURCE TEXT", detect dominant language of input).
            - Difficulty: ${difficulty} (Adjust complexity of questions).
            - Topic: ${topic} (Focus on this area).
            - **MULTI-FILE COVERAGE**: The provided text may come from multiple different files (chapters). Balance the questions across correct topics.
            
            Text: ${text.substring(0, 60000)}
            Questions: ${numQuestions}.
            Difficulty: ${difficulty}.
            Requested Types: ${Array.isArray(body.types) ? body.types.join(', ') : type}.
            Flashcards Count: 15 (IMPORTANT).
            
            Return RAW JSON ONLY with this schema:
            {
                "title": "Appropriate Title",
                "metadata": { "topics": [], "chapters": [] },
                "questions": [
                    {
                        "id": 1,
                        "type": "multiple-choice | true-false | fill-in-the-blanks | explanation",
                        "question": "The question text. For 'fill-in-the-blanks', use '_______' to denote the missing part.",
                        "options": ["...", "...", "...", "..."], // Required ONLY for multiple-choice
                        "answer": "...", // For T/F use 'True' or 'False'. For others, the correct string.
                        "explanation": "Exact quote or reference from text explaining why this is correct.",
                        "topic": "Specific Topic Name",
                        "chapter": "..."
                    }
                ],
                "vocabulary": [
                    { "word": "...", "definition": "...", "context": "..." }
                ],
                "flashcards": [
                    // GENERATE EXACTLY 15 FLASHCARDS
                    { "front": "Term/Question", "back": "Definition/Answer" }
                ]
            }
        `;

        // 1. Try Groq first if key exists (it's the most reliable fallback right now)
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt + "\n\nRETURN ONLY JSON" }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.3, // Lower temperature for accuracy
                    response_format: { type: "json_object" }
                });
                const data = JSON.parse(completion.choices[0].message.content || "{}");
                return NextResponse.json({ ...data, _provider: 'groq' });
            } catch (e) {
                console.error("Groq failed, switching to Gemini...");
            }
        }

        // 2. Gemini Multi-Model Fallback (Rotation Strategy)
        const apiKeys = [
            process.env.GEMINI_API_KEY
        ].filter(Boolean) as string[];

        const configs = [
            { id: "gemini-1.5-flash", version: "v1beta" },
            { id: "gemini-1.5-flash-8b", version: "v1beta" },
            { id: "gemini-2.0-flash-lite-preview-02-05", version: "v1beta" },
            { id: "gemini-2.0-flash", version: "v1beta" },
            { id: "gemini-1.5-pro", version: "v1beta" },
            { id: "gemini-pro", version: "v1" }
        ];

        let lastError: any = null;
        
        // Key Rotation Loop
        keyLoop: for (const apiKey of apiKeys) {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            for (const config of configs) {
                try {
                    const model = genAI.getGenerativeModel(
                        { model: config.id, generationConfig: { temperature: 0.3 } },
                        { apiVersion: config.version as any }
                    );

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const responseText = response.text();
                    
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    const quizData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
                    
                    return NextResponse.json({ ...quizData, _provider: 'gemini', _model: config.id, _key: apiKey.substring(0, 5) + '...' });
                } catch (err: any) {
                    console.warn(`FAILED Gemini ${config.id} (Key: ${apiKey.substring(0,5)}...):`, err.message);
                    lastError = err;
                    
                    // If Quota Exceeded (429), Switch KEY immediately
                    if (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('limit'))) {
                        console.warn("Quota exceeded for this key. Rotating to next key...");
                        continue keyLoop;
                    }
                    // For other errors (500, 503), try next MODEL with same key
                    continue;
                }
            }
        }

        // If even Gemini failed, informative error
        let friendlyMessage = "جميع المحركات (جوجل وغيرها) ترفض الطلب حالياً بسبب ضغط الاستخدام.";
        if (lastError?.message?.includes('limit: 0') || lastError?.message?.includes('quota') || lastError?.message?.includes('429')) {
            friendlyMessage = "⚠️ استهلكنا رصيد الذكاء الاصطناعي المجاني بسرعة! قللت حجم النصوص قليلاً، يرجى الانتظار دقيقة والمحاولة مجدداً.";
        }

        return NextResponse.json({ 
            error: friendlyMessage,
            debug: lastError?.message || "All AI providers failed"
        }, { status: 500 });

    } catch (error: any) {
        return NextResponse.json({ error: "خطأ مجهول", details: error.message }, { status: 500 });
    }
}
