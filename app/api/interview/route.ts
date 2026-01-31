import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const {
      history = [],
      query,
      domain = "general",
      cvText = "",
      language = "ar",
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const domainPrompts: Record<string, string> = {
      tech:
        language === "ar"
          ? "أنت محاور تقني خبير في كبرى شركات البرمجيات عالمياً. ركز على المفاهيم العميقة، الخوارزميات، وتصميم النظم."
          : "You are an expert technical interviewer from top global software companies. Focus on deep concepts, algorithms, and system design.",
      business:
        language === "ar"
          ? "أنت خبير في ريادة الأعمال والاستراتيجية الإدارية. ركز على الجدوى، نموذج العمل، والتفكير الاستراتيجي."
          : "You are an expert in entrepreneurship and management strategy. Focus on feasibility, business models, and strategic thinking.",
      medicine:
        language === "ar"
          ? "أنت بروفيسور طبي خبير. ركز على التشخيص الدقيق، أخلاقيات المهنة، وأحدث الأبحاث."
          : "You are an expert medical professor. Focus on accurate diagnosis, professional ethics, and latest research.",
      hr:
        language === "ar"
          ? "أنت مدير موارد بشرية محنك. ركز على المهارات الناعمة، القيادة، والذكاء العاطفي."
          : "You are a seasoned HR manager. Focus on soft skills, leadership, and emotional intelligence.",
    };

    const systemPrompt = `
      ${domainPrompts[domain] || `أنت محاور خبير في مجال ${domain}. ركز على الخبرة العملية والمهارات المطلوبة لهذا المنصب.`}
      
      ROLE:
      - You are the INTERVIEWER. You lead the conversation.
      - Conduct a PROFESSIONAL, CHALLENGING, and DATA-DRIVEN interview.
      - Use a respectful but high-pressure tone (Simulating top-tier companies).
      
      INSTRUCTIONS:
      1. ANALYZE CV: If CV text is provided below, use it to tailor the questions to the candidate's actual experience.
      2. ASK ONE QUESTION AT A TIME: Do not overwhelm the candidate.
      3. EVALUATE & PIVOT: Briefly acknowledge their last answer and move to a more complex or related question.
      4. LANGUAGE: Always respond in ${language === "ar" ? "Modern Standard Arabic (Fusha) - VERY PROFESSIONAL" : "Professional Business English"}.
      5. GO BEYOND BASICS: Ask about scenarios, trade-offs, and edge cases.
      
      ${cvText ? `Candidate CV Context:\n${cvText.substring(0, 5000)}` : "No CV provided. Conduct a general interview for the role of " + domain}
      
      Interviewing for: ${domain}
      Current Language: ${language}
      Current Stage: ${history.length < 5 ? "Initial Rapport & Basics" : "Advanced Deep Dive"}
    `;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // Standardize history for different providers
    const standardizedHistory = history.map((h: any) => ({
      role: h.role === "ai" ? "assistant" : h.role,
      content: h.content,
      // Pass reasoning_details back to OpenRouter if they exist
      ...(h.reasoning_details && { reasoning_details: h.reasoning_details }),
    }));

    // Refine system prompt to encourage reasoning usage if model supports it
    const refinedSystemPrompt = `
      ${systemPrompt}
      
      SPECIAL INSTRUCTION FOR REASONING MODELS:
      - Leverage your internal reasoning capabilities to deeply analyze the candidate's responses.
      - Think about the technical nuances, the "why" behind their answers, and follow up with probing questions that test the boundaries of their knowledge.
      - Your goal is to be the MOST SOPHISTICATED interviewer they have ever encountered.
    `;

    // 1. OpenRouter Models (Priority reasoning Support)
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openrouterApiKey) {
      const models = [
        { id: "openai/gpt-oss-120b:free", name: "GPT-OSS-120B" },
        { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid LFM" },
      ];

      for (const model of models) {
        try {
          console.log(`INTERVIEW: Trying OpenRouter (${model.name})...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: [
              { role: "system", content: refinedSystemPrompt },
              ...standardizedHistory,
              { role: "user", content: query },
            ] as any,
            // @ts-ignore
            reasoning: { enabled: true },
          });

          const choice = completion.choices[0] as any;
          if (choice?.message?.content) {
            return NextResponse.json({
              response: choice.message.content,
              reasoning_details: choice.message.reasoning_details,
              _provider: `openrouter:${model.name}`,
            });
          }
        } catch (e: any) {
          console.warn(`OpenRouter (${model.name}) attempt failed:`, e.message);
          continue; // Try next model in chain
        }
      }
    }

    // 2. Gemini Fallback
    if (geminiApiKey) {
      try {
        console.log("INTERVIEW: Trying Gemini Fallback...");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite-preview-02-05",
        });
        const result = await model.generateContent([
          refinedSystemPrompt,
          ...standardizedHistory.map((h: any) => h.content),
          query,
        ]);
        const responseText = result.response?.text();
        if (responseText) {
          return NextResponse.json({
            response: responseText,
            _provider: "gemini",
          });
        }
      } catch (e: any) {
        console.warn("Gemini interview fallback failed:", e.message);
      }
    }

    // 3. Groq Fallback
    if (groqKey) {
      try {
        console.log("INTERVIEW: Trying Groq Fallback...");
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: refinedSystemPrompt },
            ...standardizedHistory,
            { role: "user", content: query },
          ] as any,
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          return NextResponse.json({
            response: content,
            _provider: "groq",
          });
        }
      } catch (e: any) {
        console.warn("Groq interview fallback failed:", e.message);
      }
    }

    // All failed
    return NextResponse.json(
      {
        error:
          "جميع مزودي الذكاء الاصطناعي فشلوا في الرد. تأكد من إعدادات الـ API Key.",
      },
      { status: 503 },
    );
  } catch (error: any) {
    console.error("Interview API Fatal Error:", error);
    return NextResponse.json(
      { error: "خطأ في الاتصال بالخدمة", details: error.message },
      { status: 500 },
    );
  }
}
