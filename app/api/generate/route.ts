import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation (Vercel limit)
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      text,
      numQuestions = 10,
      difficulty = "Medium",
      type = "multiple-choice",
      language: requestedLang,
      topic: requestedTopic,
    } = body;

    // Enforce limit: 1-20 questions
    numQuestions = Math.max(1, Math.min(20, numQuestions));

    // Default to detecting language from text if not specific
    const language = requestedLang || "SAME AS SOURCE TEXT";
    const topic = requestedTopic || "General Coverage";

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Calculate distribution
    const selectedTypes =
      Array.isArray(body.types) && body.types.length > 0 ? body.types : [type];
    const baseCount = Math.floor(numQuestions / selectedTypes.length);
    const remainder = numQuestions % selectedTypes.length;

    const distributionNote = selectedTypes
      .map((t: string, i: number) => {
        const count = baseCount + (i < remainder ? 1 : 0);
        return `${count} questions of type '${t}'`;
      })
      .join(", ");

    const prompt = `
            system: You are a strict and precise exam generator.
            Your Goal: Generate a quiz based ONLY on the provided text.
            
            CRITICAL RULES (Prevention of Hallucinations):
            1. **STRICT GROUNDING**: All questions and answers MUST be derived directly from the text. If it's not in the text, DO NOT ask it.
            2. **ANSWER CONSISTENCY**: For 'multiple-choice', the 'answer' field MUST BE an EXACT string match to one of the 'options'. 
            3. **LANGUAGE MATCHING**: Output must match the source text language (Arabic/English).
            4. **STRICT TYPE ADHERENCE**: ONLY generate questions of the types specified below: [ ${selectedTypes.join(", ")} ].
            5. **DISTRIBUTION**: You MUST structure the quiz to have exactly: [ ${distributionNote} ]. Do not output all questions as one type.
            
            ${
              type === "coding"
                ? `
            **CODING MODE ACTIVATED**:
            - **EXCEPTION TO RULE 1**: For CODING questions, you represent an expert interviewer. You MAY generate relevant code challenges based on the *concepts* found in the text.
            - **ACCURACY**: The 'answer' field MUST be 100% correct, working, bug-free code.
            - **REQUIRED**: context "codeSnippet" field.
            - **VARIETY (CREATIVE MODES)**:
                1. **Standard**: "Write function X". 'codeSnippet' is empty.
                2. **Bug Hunt (50% Chance)**: Provide a 'codeSnippet' with a LOGIC/SYNTAX error. Question: "Fix the bug in this code". 'answer' is the corrected code.
                3. **Prediction**: "What is the output?". 'codeSnippet' is valid code. 'answer' is the output.
            - **QUESTION TYPE**: Use 'short-answer'.
            - **NEW FIELD**: Add "isBugHunt": true if Bug Hunt, and ALWAYS add "isCoding": true to every question object in this mode.
            `
                : ""
            }

            ${
              type === "mindmap"
                ? `
            **MINDMAP MODE ACTIVATED**:
            - **Goal**: Generate a COMPREHENSIVE hierarchical structure of ALL concepts in the Source Text.
            - **Coverage**: You MUST cover every single section, main idea, and significant detail found in the text. Do not summarize or skip content.
            - **Structure**:
              - Level 0: Central Topic (The main title of the material).
              - Level 1: Major Chapters/Sections.
              - Level 2: Key Concepts within those sections.
              - Level 3+: Specific details, definitions, and sub-points.
            - **Return specific JSON structure**:
              {
                "title": "Main Topic",
                "root": {
                    "id": "root",
                    "label": "Central Concept",
                    "children": [
                        { "id": "1", "label": "Sub Concept 1", "children": [...] },
                        { "id": "2", "label": "Sub Concept 2", "children": [...] }
                    ]
                }
              }
            - **Depth**: Minimum 3-4 levels deep to ensure thoroughness.
            `
                : ""
            }

            - Target Language: ${requestedLang || "SAME AS SOURCE TEXT"}
            - Difficulty: ${difficulty}.
            - Topic: ${topic}.
            
            Text: ${text.substring(0, 60000)}
            
            Return RAW JSON ONLY.
            ${
              type === "mindmap"
                ? 'Schema: { "title": "string", "root": { "id": "string", "label": "string", "children": [] } }'
                : `Schema:
            {
                "title": "Title",
                "questions": [
                    {
                        "id": 1,
                        "type": "short-answer", // PREFER THIS FOR CODING
                        "question": "Fix the bug in the following code...",
                        "codeSnippet": "function test() { retunr true; }", // REQUIRED FOR CODING
                        "options": null, 
                        "answer": "function test() { return true; }", 
                        "explanation": "The typo 'retunr' caused a syntax error.",
                        "topic": "Topic",
                        "isBugHunt": true, // OPTIONAL
                        "isCoding": true, // REQUIRED for coding questions
                        "pageNumber": null 
                    }
                ],
                "vocabulary": [],
                "flashcards": []
            }`
            }
        `;

    // --- DUAL-MODEL ROTATION STRATEGY ---
    const useGeminiFirst = Math.random() > 0.5;
    const groqKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const aimlApiKey = process.env.AIML_API_KEY;

    if (useGeminiFirst) {
      console.log("ROTATION: Trying Gemini 2.0 Flash Lite first...");
      const geminiResult = await tryGemini(
        geminiApiKey,
        "gemini-2.0-flash-lite-preview-02-05",
        prompt,
      );
      if (geminiResult) return geminiResult;

      console.log("ROTATION: Gemini failed, trying Groq fallback...");
      const groqResult = await tryGroq(groqKey, prompt);
      if (groqResult) return groqResult;
    } else {
      console.log("ROTATION: Trying Groq first...");
      const groqResult = await tryGroq(groqKey, prompt);
      if (groqResult) return groqResult;

      console.log(
        "ROTATION: Groq failed, trying Gemini 2.0 Flash Lite fallback...",
      );
      const geminiResult = await tryGemini(
        geminiApiKey,
        "gemini-2.0-flash-lite-preview-02-05",
        prompt,
      );
      if (geminiResult) return geminiResult;
    }

    // --- THIRD LAYER FALLBACK: AIML API ---
    if (aimlApiKey) {
      console.log("ALL PRIMARY FAILED. Trying AIML API Fallback...");
      const aimlResult = await tryAimlApi(aimlApiKey, prompt);
      if (aimlResult) return aimlResult;
    }

    // --- DEEP FALLBACK CHAIN (If both primary models fail) ---
    const configs = [
      { id: "gemini-2.0-flash-lite-preview-02-05", version: "v1beta" },
      { id: "gemini-1.5-flash", version: "v1beta" },
      { id: "gemini-1.5-flash-8b", version: "v1beta" },
      { id: "gemini-2.0-flash", version: "v1beta" },
    ];

    let lastError: any = null;
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      for (const config of configs) {
        try {
          const model = genAI.getGenerativeModel(
            { model: config.id, generationConfig: { temperature: 0.3 } },
            { apiVersion: config.version as any },
          );
          const result = await model.generateContent(prompt);
          const responseText = (await result.response).text();
          const quizData = parseAndVerifyQuiz(responseText);
          return NextResponse.json({
            ...quizData,
            _provider: "gemini_fallback",
            _model: config.id,
          });
        } catch (err: any) {
          console.warn(`DEEP FALLBACK FAILED: ${config.id}`, err.message);
          lastError = err;
        }
      }
    }

    // If even Gemini failed, informative error
    let friendlyMessage =
      "جميع المحركات (جوجل وغيرها) ترفض الطلب حالياً بسبب ضغط الاستخدام.";
    if (
      lastError?.message?.includes("limit: 0") ||
      lastError?.message?.includes("quota") ||
      lastError?.message?.includes("429")
    ) {
      friendlyMessage =
        "⚠️ استهلكنا رصيد الذكاء الاصطناعي المجاني بسرعة! قللت حجم النصوص قليلاً، يرجى الانتظار دقيقة والمحاولة مجدداً.";
    }

    return NextResponse.json(
      {
        error: friendlyMessage,
        debug: lastError?.message || "All AI providers failed",
      },
      { status: 500 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "خطأ مجهول", details: error.message },
      { status: 500 },
    );
  }
}

// --- HELPER CONTEXT ---

async function tryGroq(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;
  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt + "\n\nRETURN ONLY JSON" }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ ...data, _provider: "groq" });
  } catch (e) {
    console.warn("Groq attempt failed");
    return null;
  }
}

async function tryAimlApi(apiKey: string, prompt: string) {
  try {
    const res = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Or "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo" for cheaper
        messages: [
          { role: "system", content: "You represent a JSON object." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("AIML API Error:", err);
      return null;
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    const quizData = parseAndVerifyQuiz(content);
    return NextResponse.json({ ...quizData, _provider: "aiml" });
  } catch (e) {
    console.warn("AIML API attempt failed:", e);
    return null;
  }
}

async function tryGemini(
  apiKey: string | undefined,
  modelId: string,
  prompt: string,
) {
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: modelId, generationConfig: { temperature: 0.3 } },
      { apiVersion: "v1beta" },
    );
    const result = await model.generateContent(prompt);
    const responseText = (await result.response).text();
    const quizData = parseAndVerifyQuiz(responseText);
    return NextResponse.json({
      ...quizData,
      _provider: "gemini",
      _model: modelId,
    });
  } catch (e) {
    console.warn(`Gemini ${modelId} attempt failed`);
    return null;
  }
}

function parseAndVerifyQuiz(responseText: string) {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const quizData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

  if (quizData.questions && Array.isArray(quizData.questions)) {
    quizData.questions = quizData.questions.map((q: any) => {
      if (
        (q.type === "multiple-choice" || q.type === "true-false") &&
        q.options &&
        Array.isArray(q.options)
      ) {
        const exactMatch = q.options.find((opt: string) => opt === q.answer);
        if (!exactMatch) {
          const looseMatch = q.options.find(
            (opt: string) =>
              opt.toLowerCase().trim() === q.answer.toLowerCase().trim(),
          );
          if (looseMatch) {
            q.answer = looseMatch;
          } else {
            q.answer = q.options[0];
            q.explanation += " [Auto-Correction: Original answer mismatch]";
          }
        }
      }
      return q;
    });
  }
  return quizData;
}
