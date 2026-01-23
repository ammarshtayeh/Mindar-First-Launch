export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: number;
}

export const BADGES: Badge[] = [
  {
    id: "first_win",
    name: "أول إنجاز 🏆",
    icon: "🏆",
    description: "أول اختبار قمت بحله بشكل كامل وصحيح.",
  },
  {
    id: "speedster",
    name: "المتفوق السريع ⚡",
    icon: "⚡",
    description: "إكمال اختبار كامل في أقل من دقيقتين.",
  },
  {
    id: "perfect_score",
    name: "العلامة الكاملة 💯",
    icon: "🌟",
    description: "الحصول على درجة 100/100 في أحد التحديات.",
  },
  {
    id: "early_bird",
    name: "المجتهد الباكر 🌅",
    icon: "🐦",
    description: "الدراسة والعمل قبل الساعة الثامنة صباحاً.",
  },
];

export class GamificationEngine {
  private static STORAGE_KEY = "user_gamification_data";

  static getData() {
    if (typeof window === "undefined") return { xp: 0, level: 1, badges: [] };
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : { xp: 0, level: 1, badges: [] };
  }

  static addXP(amount: number) {
    const data = this.getData();
    data.xp += amount;
    data.level = Math.floor(Math.sqrt(data.xp / 50)) + 1;
    this.saveData(data);
    return data;
  }

  static unlockBadge(badgeId: string) {
    const data = this.getData();
    if (data.badges.some((b: any) => b.id === badgeId)) return data;

    const badge = BADGES.find((b) => b.id === badgeId);
    if (badge) {
      data.badges.push({ ...badge, unlockedAt: Date.now() });
      this.saveData(data);
    }
    return data;
  }

  private static saveData(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event to notify components
    window.dispatchEvent(
      new CustomEvent("gamification_update", { detail: data }),
    );
  }

  static calculateQuizXP(score: number, total: number, timeSeconds: number) {
    const baseXP = (score / total) * 100;
    const timeBonus = Math.max(0, (total * 30 - timeSeconds) / 2); // 30 sec per question ideal
    return Math.floor(baseXP + timeBonus);
  }
}
