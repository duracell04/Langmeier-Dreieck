import type { BadgeId, GamificationResult, TaskEndEvent } from "@triangle/types";

export function variantId(event: TaskEndEvent): string {
  return `${event.op}:${event.missing}:${event.lockedRole}`;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeGamification(events: TaskEndEvent[]): GamificationResult {
  const sorted = [...events].sort((a, b) => a.ts - b.ts);

  let streak = 0;
  let bestStreak = 0;

  type Accumulator = {
    attemptsTotal: number;
    correctTotal: number;
    correctFirstTry: number;
    reveals: number;
    firstTryMs: number[];
    variantsFirstTry: Set<string>;
  };

  const byProduct = new Map<number, Accumulator>();

  const ensureAcc = (product: number): Accumulator => {
    const existing = byProduct.get(product);
    if (existing) return existing;
    const created: Accumulator = {
      attemptsTotal: 0,
      correctTotal: 0,
      correctFirstTry: 0,
      reveals: 0,
      firstTryMs: [],
      variantsFirstTry: new Set<string>(),
    };
    byProduct.set(product, created);
    return created;
  };

  for (const event of sorted) {
    const isFirstTryCorrect = event.result === "correct" && event.attemptsBeforeEnd === 0;

    if (isFirstTryCorrect) {
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 0;
    }

    const acc = ensureAcc(event.familyProduct);
    acc.attemptsTotal += 1;

    if (event.result === "correct") {
      acc.correctTotal += 1;
      if (isFirstTryCorrect) {
        acc.correctFirstTry += 1;
        acc.firstTryMs.push(event.msToEnd);
        acc.variantsFirstTry.add(variantId(event));
      }
    } else {
      acc.reveals += 1;
    }
  }

  const masteryLevel = (acc: Accumulator): 0 | 1 | 2 | 3 => {
    const ft = acc.correctFirstTry;
    const c = acc.correctTotal;
    const r = acc.reveals;
    const v = acc.variantsFirstTry.size;

    if (ft >= 5 && v >= 3 && r === 0) return 3;
    if (ft >= 3 && v >= 2 && r === 0) return 2;
    if (ft >= 1 || (c >= 2 && r === 0)) return 1;
    return 0;
  };

  const masteryByFamily: GamificationResult["masteryByFamily"] = {};
  for (const [product, acc] of byProduct.entries()) {
    masteryByFamily[product] = {
      product,
      level: masteryLevel(acc),
      attemptsTotal: acc.attemptsTotal,
      correctFirstTry: acc.correctFirstTry,
      correctTotal: acc.correctTotal,
      reveals: acc.reveals,
      variantsFirstTry: [...acc.variantsFirstTry],
      medianFirstTryMs: median(acc.firstTryMs),
    };
  }

  const improvedFamilies = Object.values(masteryByFamily)
    .filter(family => family.level >= 1)
    .sort((a, b) => b.level - a.level)
    .map(family => family.product);

  const factorFinderCount = sorted.filter(
    event => event.result === "correct" && event.attemptsBeforeEnd === 0 && event.missing !== "product"
  ).length;

  const divisionKlarCount = sorted.filter(
    event => event.op === "div" && event.result === "correct" && event.attemptsBeforeEnd === 0
  ).length;

  const badgesUnlocked: Array<{ id: BadgeId; label: string }> = [];
  if (factorFinderCount >= 10) {
    badgesUnlocked.push({ id: "factor_family_finder", label: "Faktorfamilien-Finder" });
  }
  if (divisionKlarCount >= 10) {
    badgesUnlocked.push({ id: "division_klar", label: "Division klar" });
  }

  return {
    currentStreak: streak,
    bestStreak,
    improvedFamilies,
    masteryByFamily,
    badgesUnlocked: badgesUnlocked.slice(0, 2),
  };
}
