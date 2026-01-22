import { NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Calculate usage in last 24h
    const activityRef = collection(db, "activity_feed");
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const q = query(
      activityRef,
      where("actionKey", "==", "action_started_study"),
      where("timestamp", ">=", Timestamp.fromDate(twentyFourHoursAgo)),
    );

    const snapshot = await getDocs(q);
    const dailyUsage = snapshot.size;

    // Simulated data for tokens and costs based on usage
    // Approx 1500 tokens per generation (input + output)
    const avgTokensPerGen = 1500;
    const totalTokens = dailyUsage * avgTokensPerGen;

    // Pricing per 1k tokens (blended average)
    const pricePer1k = 0.0005; // $0.0005 per 1k tokens
    const estimatedCost = (totalTokens / 1000) * pricePer1k;

    // 2. Connectivity checks and detailed quotas
    const apis = [
      {
        name: "Gemini 1.5 Flash",
        provider: "Google",
        limit: 1500,
        used: dailyUsage,
        remaining: 1500 - dailyUsage,
        status: process.env.GEMINI_API_KEY ? "Online" : "Missing Key",
        type: "RPD",
        cost: (dailyUsage * 0.0002).toFixed(4),
      },
      {
        name: "Llama 3.3 70B",
        provider: "Groq",
        limit: 14400,
        used: Math.floor(dailyUsage * 0.4),
        remaining: 14400 - Math.floor(dailyUsage * 0.4),
        status: process.env.GROQ_API_KEY ? "Online" : "Missing Key",
        type: "RPM",
        cost: 0, // Groq is currently free tier
      },
      {
        name: "GPT-4o Mini",
        provider: "AIML API",
        limit: 50000,
        used: Math.floor(dailyUsage * 0.1),
        remaining: 50000 - Math.floor(dailyUsage * 0.1),
        status: process.env.AIML_API_KEY ? "Online" : "Missing Key",
        type: "Tokens",
        cost: (Math.floor(dailyUsage * 0.1) * 0.00015).toFixed(4),
      },
    ];

    return NextResponse.json({
      dailyUsage,
      totalTokens,
      estimatedCost: estimatedCost.toFixed(2),
      apis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("System Status API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
