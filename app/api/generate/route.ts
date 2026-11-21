import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { normalizeArabic } from "@/lib/text-normalizer";
import {
  GEMINI_FALLBACK_CHAIN,
  GEMINI_MODELS,
  GROQ_MODELS,
  OPENROUTER_PRIORITY_MODELS,
} from "@/lib/ai/models";
import {
  applyLearningModeDefaults,
  learningModePromptBlock,
} from "@/lib/learning-mode";

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
      mode: requestedMode,
      focusTopics: requestedFocusTopics = [],
    } = body;

    const modeDefaults = applyLearningModeDefaults({
      mode: requestedMode,
      numQuestions,
      difficulty,
    });
    numQuestions = modeDefaults.numQuestions;
    difficulty = modeDefaults.difficulty;
    const learningMode = modeDefaults.mode;
    const focusTopics = Array.isArray(requestedFocusTopics)
      ? requestedFocusTopics.filter(
          (t: unknown) => typeof t === "string" && String(t).trim().length > 0,
        )
      : [];

    // Default to detecting language from text if not specific
    const language = requestedLang || "SAME AS SOURCE TEXT";
    const topic = requestedTopic || "General Coverage";

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Normalize Arabic text to ensure consistency
    text = normalizeArabic(text);

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
            2. **TOC FILTERING**: NEVER generate questions from Table of Contents pages (keywords: فهرس، محتويات، جدول، Contents, Index). Skip lines that look like: "Chapter X ........ Page Y".
            3. **ANSWER CONSISTENCY**: For 'multiple-choice', the 'answer' field MUST BE an EXACT string match to one of the 'options'. 
            4. **LANGUAGE MATCHING**: Output must match the source text language (Arabic/English).
            5. **STRICT TYPE ADHERENCE**: ONLY generate questions of the types specified below: [ ${selectedTypes.join(", ")} ].
            6. **DISTRIBUTION**: You MUST structure the quiz to have exactly: [ ${distributionNote} ]. Do not output all questions as one type.
            
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
            ${learningModePromptBlock(learningMode, language, focusTopics)}
            
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

    // --- RELIABLE ROTATION: Gemini → Groq → AIML → OpenRouter ---
    const groqKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const aimlApiKey = process.env.AIML_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    console.log(`ROTATION: Trying Gemini ${GEMINI_MODELS.primary} first...`);
    const geminiResult = await tryGemini(
      geminiApiKey,
      GEMINI_MODELS.primary,
      prompt,
    );
    if (geminiResult) return await withMode(geminiResult, learningMode);

    console.log("ROTATION: Gemini failed, trying Groq fallback...");
    const groqResult = await tryGroq(groqKey, prompt);
    if (groqResult) return await withMode(groqResult, learningMode);

    if (aimlApiKey) {
      console.log("ROTATION: Trying AIML API Fallback...");
      const aimlResult = await tryAimlApi(aimlApiKey, prompt);
      if (aimlResult) return await withMode(aimlResult, learningMode);
    }

    if (openrouterApiKey) {
      console.log("ROTATION: Trying OpenRouter as last resort...");
      const orResult = await tryOpenRouter(prompt);
      if (orResult) return await withMode(orResult, learningMode);
    }

    // --- DEEP FALLBACK CHAIN (If both primary models fail) ---
    let lastError: any = null;
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      for (const config of GEMINI_FALLBACK_CHAIN) {
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
            _learningMode: learningMode,
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

async function withMode(response: NextResponse, learningMode: string) {
  const data = await response.json();
  return NextResponse.json({ ...data, _learningMode: learningMode });
}

async function tryOpenRouter(prompt: string) {
  // Keep OpenRouter short — free models can hang and burn Vercel time.
  for (const model of OPENROUTER_PRIORITY_MODELS.slice(0, 2)) {
    try {
      console.log(`ROTATION: Trying OpenRouter (${model.name})...`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mindar.tech",
          "X-Title": "Mindar",
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: "user", content: prompt + "\n\nRETURN ONLY JSON" },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        console.warn(`OpenRouter (${model.name}) HTTP ${res.status}`);
        continue;
      }
      const completion = await res.json();
      const content = completion.choices?.[0]?.message?.content || "{}";
      const quizData = parseAndVerifyQuiz(content);
      return NextResponse.json({
        ...quizData,
        _provider: `openrouter:${model.name}`,
      });
    } catch (e: any) {
      console.warn(`OpenRouter (${model.name}) attempt failed:`, e.message);
      continue;
    }
  }
  return null;
}

async function tryGroq(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;
  const groq = new Groq({ apiKey });
  const models = [
    GROQ_MODELS.primary,
    GROQ_MODELS.fast,
    GROQ_MODELS.alt,
  ];

  for (const modelId of models) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt + "\n\nRETURN ONLY JSON" }],
        model: modelId,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      const data = JSON.parse(completion.choices[0].message.content || "{}");
      return NextResponse.json({
        ...data,
        _provider: "groq",
        _model: modelId,
      });
    } catch (e: any) {
      console.warn(`Groq ${modelId} attempt failed:`, e.message);
    }
  }
  return null;
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
        // Normalize options and answer for Arabic consistency
        q.options = q.options.map((opt: string) => normalizeArabic(opt));
        q.answer = normalizeArabic(q.answer);

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
