import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let language = "ar";
  try {
    const body = await req.json();
    const { history = [], query, domain = "general", cvText = "" } = body;
    if (body.language) language = body.language;

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!geminiApiKey && !groqKey && !openrouterApiKey) {
      return NextResponse.json(
        {
          error:
            language === "ar"
              ? "لم يتم العثور على أي API Key (Gemini, Groq, or OpenRouter). يرجى إضافتها في ملف .env.local"
              : "No API Keys found (Gemini, Groq, or OpenRouter). Please add them to your .env.local file.",
        },
        { status: 401 },
      );
    }

    const domainPrompts: Record<string, string> = {
      tech:
        language === "ar"
          ? "أنت ممارس تقني خبير وموجه لخريجي الجامعات الجدد. ابدأ بالأساسيات الأكاديمية والمنطق البرمجي، وكن صبوراً وداعماً جداً."
          : "You are an experienced technical practitioner and a mentor for fresh university graduates. Start with academic fundamentals and programming logic, be patient and very supportive.",
      business:
        language === "ar"
          ? "أنت مستشار أعمال ومعلم. ركز على فهم المبادئ الإدارية والمالية الأساسية التي يتعلمها الخريجون الجدد."
          : "You are a business consultant and educator. Focus on understanding the core management and financial principles that fresh graduates learn.",
      medicine:
        language === "ar"
          ? "أنت طبيب استشاري ومعلم للأطباء الجدد. ركز على المبادئ السريرية الأساسية وسلامة المرضى بلهجة مشجعة."
          : "You are a consultant physician and an educator for new doctors. Focus on basic clinical principles and patient safety with an encouraging tone.",
      hr:
        language === "ar"
          ? "أنت خبير موارد بشرية متخصص في توظيف الخريجين الجدد. ابحث عن الطموح، سرعة التعلم، والذكاء العاطفي الأساسي."
          : "You are an HR expert specializing in hiring fresh graduates. Look for ambition, learning speed, and basic emotional intelligence.",
    };

    // PHASE LOGIC based on history length (each turn is 2 messages: user + assistant)
    const turnCount = Math.floor(history.length / 2);
    let phaseInstruction = "";

    if (turnCount < 3) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الأولى: الأساسيات الأكاديمية. اطرح سؤالاً جوهرياً بسيطاً (مثلاً: ما الفرق بين الـ Interface والـ Class في الـ OOP؟) لجس نبض القواعد الرئيسية."
          : "Phase 1: Academic Fundamentals. Ask a simple, core question (e.g., Difference between Interface and Class in OOP?) to gauge the main rules.";
    } else if (turnCount < 7) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الثانية: التفكير المنطقي. اعطِ المرشح تحدياً برمجياً أو إدارياً بسيطاً يختبر قدرته على حل المشكلات بهدوء."
          : "Phase 2: Logical Thinking. Give the candidate a simple programming or management challenge to test their problem-solving ability calmly.";
    } else if (turnCount < 10) {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الثالثة: توسيع المدارك. اطرح تقنية أو مفهوماً متوسطاً وشجعه على التفكير في كيفية تطبيقه."
          : "Phase 3: Mindset Expansion. Introduce a mid-level technology or concept and encourage them to think about its application.";
    } else {
      phaseInstruction =
        language === "ar"
          ? "المرحلة الرابعة: الختام التوجيهي. قدم تقييماً مليئاً بالنصائح المهنية، واختم بكلمات تحفيزية للانطلاق في سوق العمل."
          : "Phase 4: Mentorship & Exit. Provide an evaluation full of professional tips, and conclude with motivational words for entering the job market.";
    }

    const systemPrompt = `
      ${domainPrompts[domain] || `أنت موجه خبير لخريجي الـ ${domain}.`}
      
      STRICT SUPPORTIVE DIRECTIVES:
      - PERSONA: You are a GENTLE MENTOR for FRESH GRADUATES. Use simple language. Avoid deep industry jargon.
      - LOGIC & BASICS: Your goal is to see if the candidate has a good logical foundation and understands university-level basics. 
      - QUESTIONS: Keep questions LIGHT and CLEAR. Only one question at a time. 
      - DETECTING "I DON'T KNOW": If the user says "أجبني", "لا أعرف", "ما بعرف", "شو الجواب", "Answer me", "I don't know" - provide a kind, clear explanation first, then ask a simple follow-up.
      - ENCOURAGEMENT: If they get it right, give brief praise. If wrong, give a hint instead of the answer.
      
      CURRENT PHASE:
      ${phaseInstruction}
      
      ${cvText ? `GRADUATE CV (Context Only):\n${cvText.substring(0, 3000)}` : "No CV provided."}
      
      Role: ${domain}
      Turn: ${turnCount + 1}
    `;

    // Standardize history for OpenRouter/Groq
    const standardizedHistory = history.map((h: any) => ({
      role: h.role === "ai" ? "assistant" : h.role,
      content: h.content,
    }));

    // 1. OpenRouter Models (Priority)
    if (openrouterApiKey) {
      const models = [
        { id: "openai/gpt-oss-120b:free", name: "GPT-OSS-120B" },
        { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid LFM" },
      ];

      for (const model of models) {
        try {
          console.log(`INTERVIEW: Trying ${model.name}...`);
          const { openrouter } = await import("@/lib/openrouter");
          const completion = await openrouter.chat.completions.create({
            model: model.id,
            messages: [
              { role: "system", content: systemPrompt },
              ...standardizedHistory,
              { role: "user", content: query },
            ] as any,
          });

          const content = completion.choices[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              response: content,
              _provider: `openrouter:${model.name}`,
            });
          }
        } catch (e: any) {
          console.warn(`${model.name} failed:`, e.message);
        }
      }
    }

    // 2. Gemini Fallback (Using stable content format)
    if (geminiApiKey) {
      try {
        console.log("INTERVIEW: Trying Gemini...");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const contents = [
          { role: "user", parts: [{ text: systemPrompt }] },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I will be a supportive mentor for this graduate interview.",
              },
            ],
          },
          ...history.map((h: any) => ({
            role: h.role === "ai" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          { role: "user", parts: [{ text: query }] },
        ];

        const result = await model.generateContent({ contents });
        const responseText = result.response.text();
        if (responseText) {
          return NextResponse.json({
            response: responseText,
            _provider: "gemini",
          });
        }
      } catch (e: any) {
        console.warn("Gemini failure:", e.message);
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
          language === "ar"
            ? "جميع مزودي الخدمة توقفوا فجأة. يرجى التأكد من صلاحية مفاتيح الـ API في .env.local أو حاول مجدداً بعد دقيقة."
            : "All AI providers failed. Please check your API keys in .env.local or try again in a minute.",
      },
      { status: 503 },
    );
  } catch (error: any) {
    console.error("Interview API Fatal Error:", error);
    return NextResponse.json(
      {
        error:
          language === "ar"
            ? "خطأ في الاتصال بالخدمة"
            : "Service connection error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
