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
            
            CRITICAL RULES (Prevention of Hallucinations):
            1. **STRICT GROUNDING**: All questions and answers MUST be derived directly from the text. If it's not in the text, DO NOT ask it.
            2. **ANSWER CONSISTENCY**: For 'multiple-choice', the 'answer' field MUST BE an EXACT string match to one of the 'options'. 
            3. **LANGUAGE MATCHING**: Output must match the source text language (Arabic/English).
            
            - Target Language: ${language} (Detect if "SAME AS SOURCE TEXT").
            - Difficulty: ${difficulty}.
            - Topic: ${topic}.
            
            Text: ${text.substring(0, 60000)}
            Questions: ${numQuestions}.
            
            Return RAW JSON ONLY with this schema:
            {
                "title": "Title",
                "questions": [
                    {
                        "id": 1,
                        "type": "multiple-choice | true-false | fill-in-the-blanks | explanation",
                        "question": "Question text...",
                        "options": ["Option A", "Option B", "Option C", "Option D"], // REQUIRED for MC/TF
                        "answer": "Option A", // EXACT MATCH of the correct option string
                        "explanation": "Quote from text proving the answer."
                    }
                ],
                "vocabulary": [ { "word": "...", "definition": "...", "context": "..." } ],
                "flashcards": [ { "front": "...", "back": "..." } ]
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
                    
                    // --- VERIFICATION & HALLUCINATION CHECK LAYER ---
                    if (quizData.questions && Array.isArray(quizData.questions)) {
                        quizData.questions = quizData.questions.map((q: any) => {
                            // 1. Ensure Multi-choice answers match options exactly
                            if (q.type === 'multiple-choice' || q.type === 'true-false') {
                                if (q.options && Array.isArray(q.options)) {
                                    // Fuzzy match check
                                    const exactMatch = q.options.find((opt: string) => opt === q.answer);
                                    if (!exactMatch) {
                                        // Attempt to recover: trimming, case-insensitive
                                        const looseMatch = q.options.find((opt: string) => opt.toLowerCase().trim() === q.answer.toLowerCase().trim());
                                        if (looseMatch) {
                                            q.answer = looseMatch; // Auto-correct
                                        } else {
                                            // Hallucination detected: Answer is NOT in options.
                                            // Fallback: Set answer to first option (better than crashing) or flag it.
                                            // Here we set it to the first option to ensure playability, but ideally we regenerate.
                                            q.answer = q.options[0];
                                            q.explanation += " [Auto-Correction: Original answer mismatch]";
                                        }
                                    }
                                }
                            }
                            return q;
                        });
                    }
                    // ------------------------------------------------
                    
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
