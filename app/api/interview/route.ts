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
          ? "أنت محاور تقني 'نخبة' من أفضل 1% في العالم. لا تقبل إلا بالأفضل. حلل الـ CV بعمق واسأل عن تفاصيل تقنية لا يسألها إلا الخبراء."
          : "You are a 'Top 1% Elite' technical interviewer. Accept only excellence. Deeply analyze the CV and ask about technical nuances only experts would know.",
      business:
        language === "ar"
          ? "أنت خبير استراتيجي عالمي ومستثمر مغامر. ركز على التفكير النقدي، الأرقام، والقدرة على مواجهة المخاطر."
          : "You are a global strategist and venture capitalist. Focus on critical thinking, numbers, and risk management.",
      medicine:
        language === "ar"
          ? "أنت رئيس مجلس طبي دولي. دقيق جداً، تركز على التفاصيل السريرية المعقدة والقرارات الحاسمة."
          : "You are the head of an international medical board. Extremely precise, focusing on complex clinical details and critical decisions.",
      hr:
        language === "ar"
          ? "أنت صائد مهارات (Headhunter) عالمي للمناصب القيادية العليا. ابحث عن جوهر الشخصية والذكاء العاطفي الخارق."
          : "You are a global executive headhunter. Look for core character and exceptional emotional intelligence.",
    };

    // PHASE LOGIC based on history length (each turn is 2 messages: user + assistant)
    const turnCount = Math.floor(history.length / 2);
    let phaseInstruction = "";

    if (turnCount < 2) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الأولى: مقدمة ذكية وسؤال أساسي مرتبط مباشرة بالخبرات المذكورة في الـ CV."
          : "Phase 1: Smart introduction and a baseline question directly linked to the CV experiences.";
    } else if (turnCount < 5) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الثانية: العمق التقني والاحترافي. تحدَّ المرشح في مهارات محددة ادعى امتلاكها."
          : "Phase 2: Technical/Professional Depth. Challenge the candidate on specific skills they claim to possess.";
    } else if (turnCount < 7) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الثالثة: سيناريو ضغط. اعطِ المرشح موقفاً صعباً يتطلب اتخاذ قرار معقد أو مفاضلة (Trade-off)."
          : "Phase 3: Stress/Scenario. Give the candidate a tough situation requiring complex decision-making or trade-offs.";
    } else {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الرابعة: الختام. لخص انطباعك بأسلوب احترافي ونخوي، واطرح سؤالاً ختامياً أو أعلن نهاية المقابلة."
          : "Phase 4: Conclusion. Summarize your impression professionally and elitely, and ask a closing question or signal the end.";
    }

    const systemPrompt = `
      ${domainPrompts[domain] || `أنت صائد كفاءات خبير في مجال ${domain}.`}
      
      EXCELLENCE DIRECTIVES:
      - You are NOT a generic AI. You are a high-level interviewer (Elite/Savage).
      - LOGICAL FLOW: Your questions MUST follow from the previous answer but push deeper.
      - CV FIRST: Every question must feel like it was written AFTER reading their specific CV.
      - CONCISE: Do not waste words. Be direct, professional, and slightly intimidating.
      - LIMIT: Total interview is roughly 6-8 questions.
      
      CURRENT PHASE INSTRUCTION:
      ${phaseInstruction}
      
      ${cvText ? `CANDIDATE CV DATA (Tailor strictly to this):\n${cvText.substring(0, 5000)}` : "No CV provided. Ask questions based on the elite standards of " + domain}
      
      Interviewing for: ${domain}
      Current Turn: ${turnCount + 1}
      
      SPECIAL INSTRUCTION FOR REASONING MODELS:
      - Leverage your internal reasoning capabilities to deeply analyze the candidate's responses.
      - Think about the technical nuances, the "why" behind their answers, and follow up with probing questions that test the boundaries of their knowledge.
      - Your goal is to be the MOST SOPHISTICATED interviewer they have ever encountered.
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
              { role: "system", content: systemPrompt },
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
          systemPrompt,
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
            { role: "system", content: systemPrompt },
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
