import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeArabic, processText } from "@/lib/text-normalizer";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { text, language: requestedLang } = body;

    const language = requestedLang || "SAME AS SOURCE TEXT";

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Use comprehensive processing
    text = processText(text);

    const prompt = `
        Architect a hierarchical Knowledge Galaxy (Graph) in JSON.
        
        DATA STRUCTURE:
        - Level 0: Root (Main Title, val: 20)
        - Level 1: Main Topics (Max 6, val: 15)
        - Level 2: Sub-concepts (val: 10)
        - Level 3: Details (val: 5)
        
        SCHEMA:
        {
            "title": "Material Title",
            "language": "The language used in the material (e.g., Arabic or English)",
            "nodes": [{ 
                "id": "uuid", 
                "name": "Concept", 
                "val": size, 
                "color": "hex", 
                "level": number,
                "description": "Short explanation (Max 20 words)",
                "source_excerpt": "The EXACT sentence or paragraph from the text where this CONCEPT is mentioned."
            }],
            "links": [{ "source": "id", "target": "id" }]
        }
        
        CONSTRAINTS:
        - Use ONLY concepts from provided text.
        - Language: ${language}.
        - Colors: Level 0: gold (#FFD700), Level 1: purple (#8A2BE2), Level 2: blue (#1E90FF), Level 3: cyan (#00CED1).
        
        TEXT CONTENT:
        ${text.substring(0, 20000)}
    `;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("GALAXY API: Gemini API Key is missing!");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const models = [
      { id: "gemini-3.8-flash", version: "v1beta" },
      { id: "gemini-3.5-flash-lite", version: "v1beta" },
      { id: "gemini-2.5-flash-lite", version: "v1beta" },
    ];

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    // --- 0. Try OpenRouter First if available (High availability) ---
    if (openrouterApiKey) {
      const orModels = [
        "google/gemma-2-9b-it:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "openchat/openchat-7b:free",
      ];

      for (const modelId of orModels) {
        try {
          console.log(`GALAXY API: Attempting with OpenRouter (${modelId})...`);
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
                response_format: { type: "json_object" },
              }),
            },
          );
          if (res.ok) {
            const completion = await res.json();
            const content = completion.choices[0]?.message?.content;
            if (content) {
              const jsonStr = content.substring(
                content.indexOf("{"),
                content.lastIndexOf("}") + 1,
              );
              console.log(`GALAXY API: Success with OR:${modelId}.`);
              return NextResponse.json(JSON.parse(jsonStr));
            }
          } else {
            const errText = await res.text();
            console.warn(`GALAXY API: OR:${modelId} failed:`, errText);
          }
        } catch (e) {
          console.warn(
            `GALAXY API: OpenRouter fallback failed for ${modelId}:`,
            e,
          );
        }
      }
    }

    let lastError = null;

    for (const config of models) {
      try {
        console.log(
          `GALAXY API: Attempting with ${config.id} (${config.version})...`,
        );
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel(
          {
            model: config.id,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          },
          { apiVersion: config.version as any },
        );

        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();

        const jsonStr = responseText.substring(
          responseText.indexOf("{"),
          responseText.lastIndexOf("}") + 1,
        );

        const galaxyData = JSON.parse(jsonStr);
        console.log(`GALAXY API: Success with ${config.id}.`);
        return NextResponse.json(galaxyData);
      } catch (err: any) {
        console.warn(`GALAXY API: ${config.id} failed:`, err.message);
        lastError = err;
        // If it's a 429, don't stop, try next model immediately
      }
    }

    let friendlyMessage = "فشل بناء المجرة حالياً بسبب ضغط كبير على السيرفرات.";
    if (
      lastError?.message?.includes("429") ||
      lastError?.message?.includes("exhausted")
    ) {
      friendlyMessage =
        "⚠️ استهلكنا رصيد الذكاء الاصطناعي المجاني لليوم! يرجى الانتظار 30 ثانية والمحاولة مجدداً، أو اختيار مادة أصغر.";
    }

    throw lastError || new Error(friendlyMessage);
  } catch (error: any) {
    console.error("GALAXY API: Final Error:", error.message);
    return NextResponse.json(
      { error: "Galaxy construction failed", details: error.message },
      { status: 500 },
    );
  }
}
