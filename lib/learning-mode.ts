export type LearningMode = "catchup" | "exam";

export const LEARNING_MODE_KEY = "mindar_learning_mode";
export const GAP_FOCUS_TOPICS_KEY = "mindar_gap_focus_topics";

export function normalizeLearningMode(value: unknown): LearningMode {
  return value === "catchup" ? "catchup" : "exam";
}

export function getStoredLearningMode(): LearningMode {
  if (typeof window === "undefined") return "exam";
  return normalizeLearningMode(localStorage.getItem(LEARNING_MODE_KEY));
}

export function setStoredLearningMode(mode: LearningMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARNING_MODE_KEY, mode);
}

export function getGapFocusTopics(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GAP_FOCUS_TOPICS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((t) => typeof t === "string" && t.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function clearGapFocusTopics() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GAP_FOCUS_TOPICS_KEY);
}

export function applyLearningModeDefaults(input: {
  mode?: unknown;
  numQuestions?: number;
  difficulty?: string;
}) {
  const mode = normalizeLearningMode(input.mode);
  const difficulty =
    input.difficulty || (mode === "catchup" ? "Easy" : "Medium");
  const defaultCount = mode === "catchup" ? 8 : 10;
  const numQuestions = Math.max(
    1,
    Math.min(20, input.numQuestions ?? defaultCount),
  );

  return { mode, difficulty, numQuestions };
}

export function learningModePromptBlock(
  mode: LearningMode,
  languageHint: string,
  focusTopics: string[] = [],
) {
  const focusBlock =
    focusTopics.length > 0
      ? `
            **PRIORITY WEAK TOPICS (must emphasize):**
            ${focusTopics.map((t) => `- ${t}`).join("\n")}
            Generate most questions from these weak topics while staying grounded in the source text.
            `
      : "";

  if (mode === "catchup") {
    return `
            **LEARNING MODE: CATCH-UP / SUPPORTIVE EDUCATION**
            - Audience: school students recovering missed lessons due to irregular attendance.
            - Prefer foundational checks, clear wording, and short explanations.
            - Focus on the most essential concepts a student must regain before returning to class.
            - Difficulty bias: easier to medium; avoid trick questions.
            - Language tone: encouraging supportive tutor (${languageHint}).
            ${focusBlock}
            `;
  }

  return `
            **LEARNING MODE: EXAM PREP / UNIVERSITY**
            - Audience: university students preparing from lecture materials.
            - Prefer exam-style depth, mixed recall and application.
            - Cover key lecture ideas thoroughly; keep answers grounded in the source text.
            - Difficulty bias: medium to hard when requested.
            - Language tone: precise academic tutor (${languageHint}).
            ${focusBlock}
            `;
}
