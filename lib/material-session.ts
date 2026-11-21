/** Single source of truth for the active study material in the browser. */

export const MATERIAL_TEXT_KEY = "hub_source_text";
export const MATERIAL_META_KEY = "mindar_material_meta";
export const REEL_CACHE_KEY = "mindar_last_reel";

export type MaterialMeta = {
  title: string;
  hash: string;
  updatedAt: number;
  source?: "upload" | "commons" | "command" | "unknown";
};

/** Fast stable fingerprint — avoids wrong cache hits when only length matches. */
export function hashMaterial(text: string): string {
  const sample = `${text.length}:${text.slice(0, 240)}:${text.slice(-240)}`;
  let h = 2166136261;
  for (let i = 0; i < sample.length; i++) {
    h ^= sample.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export function getMaterialText(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(MATERIAL_TEXT_KEY) || "";
}

export function getMaterialMeta(): MaterialMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MATERIAL_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MaterialMeta;
  } catch {
    return null;
  }
}

/** Clears AI outputs tied to a previous material so sessions don't collide. */
export function clearDerivedMaterialCaches() {
  if (typeof window === "undefined") return;
  const keys = [
    REEL_CACHE_KEY,
    "currentQuiz",
    "currentMindMap",
    "challengeQuiz",
    "lastQuizResults",
    "mindar_gap_focus_topics",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

export function setMaterialSession(
  text: string,
  options?: {
    title?: string;
    source?: MaterialMeta["source"];
    clearDerived?: boolean;
  },
) {
  if (typeof window === "undefined") return null;
  const clean = (text || "").trim();
  if (!clean) return null;

  const prev = getMaterialMeta();
  const hash = hashMaterial(clean);
  const shouldClear =
    options?.clearDerived !== false && (!prev || prev.hash !== hash);

  if (shouldClear) clearDerivedMaterialCaches();

  const meta: MaterialMeta = {
    title:
      options?.title?.trim() ||
      (prev?.hash === hash ? prev.title : "") ||
      "Study Material",
    hash,
    updatedAt: Date.now(),
    source: options?.source || "unknown",
  };

  localStorage.setItem(MATERIAL_TEXT_KEY, clean);
  localStorage.setItem(MATERIAL_META_KEY, JSON.stringify(meta));
  return meta;
}

export function clearMaterialSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MATERIAL_TEXT_KEY);
  localStorage.removeItem(MATERIAL_META_KEY);
  clearDerivedMaterialCaches();
}

export function getMaterialTitle(): string {
  return getMaterialMeta()?.title || "Study Material";
}
