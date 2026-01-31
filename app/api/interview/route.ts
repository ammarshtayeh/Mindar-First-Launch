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
    }));

    // Try Gemini first (Best for nuanced persona)
    if (geminiApiKey) {
      const models = [
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-1.5-flash",
      ];
      for (const modelId of models) {
        try {
          console.log(`INTERVIEW: Trying Gemini ${modelId}...`);
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({
            model: modelId,
          });

          const result = await model.generateContent([
            systemPrompt,
            ...standardizedHistory.map((h: any) => h.content),
            query,
          ]);

          const response = await result.response;
          return NextResponse.json({ response: response.text() });
        } catch (e: any) {
          console.error(`Gemini (${modelId}) Error:`, e.message);
        }
      }
    }

    // Fallback to Groq (Fast & reliable)
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
        return NextResponse.json({
          response: completion.choices[0].message.content,
        });
      } catch (e: any) {
        console.error("Groq Interview Error:", e.message);
      }
    }

    return NextResponse.json(
      {
        error:
          "جميع مزودي الذكاء الاصطناعي فشلوا في الرد. تأكد من إعدادات الـ API Key.",
      },
      { status: 500 },
    );
  } catch (error: any) {
    console.error("Interview Route Critical Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
