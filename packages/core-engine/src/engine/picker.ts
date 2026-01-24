import type {
  DivisionMeaning,
  FamilyMastery,
  MissingSlot,
  Operation,
  ProductFamily,
  Task,
} from "@triangle/types";
import { generateTaskFromFamily } from "./generateTask";

export interface PickerOptions {
  now?: number;
  rng?: () => number;
  recentFamilyIds?: string[];
  operation?: Operation | "mix";
  missing?: MissingSlot | "mix";
  divisionMeaning?: DivisionMeaning | "mix";
}

function defaultMastery(familyId: string, now: number): FamilyMastery {
  return {
    familyId,
    bucket: 0,
    consecutiveCorrect: 0,
    lastSeenTs: now,
    dueTs: now,
    errors: {},
  };
}

function weightForFamily(mastery: FamilyMastery): number {
  const errorCount = Object.values(mastery.errors).reduce((a, b) => a + (b ?? 0), 0);
  const bucketWeight = 1 + (4 - mastery.bucket) * 0.6;
  return bucketWeight + Math.min(errorCount * 0.1, 1.5);
}

function pickWeighted<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

function resolveOperation(
  mastery: FamilyMastery,
  op: Operation | "mix" | undefined,
  rng: () => number
): Operation {
  if (op && op !== "mix") return op;
  if (mastery.lastWrongOperation === "div" && rng() < 0.7) return "mul";
  return rng() < 0.5 ? "mul" : "div";
}

function resolveMissing(
  operation: Operation,
  missing: MissingSlot | "mix" | undefined,
  rng: () => number
): MissingSlot {
  if (missing && missing !== "mix") return missing;
  if (operation === "div") return rng() < 0.5 ? "left" : "right";
  return pickWeighted(["product", "left", "right"], [0.4, 0.3, 0.3], rng);
}

function resolveMeaning(
  operation: Operation,
  meaning: DivisionMeaning | "mix" | undefined,
  rng: () => number
): DivisionMeaning | undefined {
  if (operation !== "div") return undefined;
  if (meaning && meaning !== "mix") return meaning;
  return rng() < 0.5 ? "quotitive" : "partitive";
}

export function pickNextTask(
  families: ProductFamily[],
  masteryMap: Record<string, FamilyMastery>,
  options: PickerOptions = {}
): Task {
  if (families.length === 0) throw new Error("No ProductFamilies available");

  const now = options.now ?? Date.now();
  const rng = options.rng ?? Math.random;
  const recentSet = new Set((options.recentFamilyIds ?? []).slice(-2));

  const withMastery = families.map(f => ({
    family: f,
    mastery: masteryMap[f.id] ?? defaultMastery(f.id, now),
  }));

  const due = withMastery.filter(item => item.mastery.dueTs <= now);
  const pool = due.length > 0 ? due : withMastery;

  const nonRecent = pool.filter(item => !recentSet.has(item.family.id));
  const selectionPool = nonRecent.length > 0 ? nonRecent : pool;

  const weights = selectionPool.map(item => weightForFamily(item.mastery));
  const chosen = pickWeighted(selectionPool, weights, rng);

  const operation = resolveOperation(chosen.mastery, options.operation, rng);
  const missing = resolveMissing(operation, options.missing, rng);
  const divisionMeaning = resolveMeaning(operation, options.divisionMeaning, rng);

  return generateTaskFromFamily(chosen.family, {
    operation,
    missing,
    divisionMeaning,
    rng,
  });
}
