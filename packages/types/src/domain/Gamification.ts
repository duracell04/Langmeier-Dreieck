export type BadgeId = "factor_family_finder" | "division_klar" | "tauschprofi";

export interface FamilyGamificationStats {
  product: number;
  level: 0 | 1 | 2 | 3;
  attemptsTotal: number;
  correctFirstTry: number;
  correctTotal: number;
  reveals: number;
  variantsFirstTry: string[];
  medianFirstTryMs?: number;
}

export interface GamificationResult {
  currentStreak: number;
  bestStreak: number;
  improvedFamilies: number[];
  masteryByFamily: Record<number, FamilyGamificationStats>;
  badgesUnlocked: Array<{ id: BadgeId; label: string }>;
}
