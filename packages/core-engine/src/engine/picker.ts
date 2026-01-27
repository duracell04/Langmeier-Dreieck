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
  recentTasks?: Task[];
  recentFamilyWindow?: number;
  swapSpacing?: number;
  swap?: "keep" | "swap" | "mix";
  divisionEnabled?: boolean;
  squareMode?: "default" | "single";
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

function pickPair(family: ProductFamily, rng: () => number): [number, number] {
  const idx = Math.floor(rng() * family.factorPairs.length);
  return family.factorPairs[Math.min(idx, family.factorPairs.length - 1)];
}

function isSquare(pair: [number, number]): boolean {
  return pair[0] === pair[1];
}

export function pickNextTask(
  families: ProductFamily[],
  masteryMap: Record<string, FamilyMastery>,
  options: PickerOptions = {}
): Task {
  if (families.length === 0) throw new Error("No ProductFamilies available");

  const now = options.now ?? Date.now();
  const rng = options.rng ?? Math.random;
  const recentWindow = options.recentFamilyWindow ?? 3;
  const recentSet = new Set((options.recentFamilyIds ?? []).slice(-recentWindow));

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

  const attempts = 6;
  const recentTasks = options.recentTasks ?? [];
  const swapSpacing = options.swapSpacing ?? 2;
  const divisionEnabled = options.divisionEnabled ?? true;
  const squareMode = options.squareMode ?? "default";

  for (let i = 0; i < attempts; i += 1) {
    const operation = divisionEnabled ? resolveOperation(chosen.mastery, options.operation, rng) : "mul";
    if (operation === "div" && chosen.family.product === 0) {
      continue;
    }

    const missing = resolveMissing(operation, options.missing, rng);
    const divisionMeaning = resolveMeaning(operation, options.divisionMeaning, rng);
    const pair = pickPair(chosen.family, rng);
    const squareSharedInput = squareMode === "single" && isSquare(pair) && missing !== "product";
    const task = generateTaskFromFamily(chosen.family, {
      operation,
      missing,
      divisionMeaning,
      rng,
      swap: options.swap ?? "mix",
      pair,
      squareSharedInput,
    });

    if (swapSpacing > 0 && violatesSwapSpacing(task, recentTasks, swapSpacing)) {
      continue;
    }
    return task;
  }

  let fallbackOperation = divisionEnabled ? resolveOperation(chosen.mastery, options.operation, rng) : "mul";
  if (fallbackOperation === "div" && chosen.family.product === 0) {
    fallbackOperation = "mul";
  }
  const fallbackMissing = resolveMissing(fallbackOperation, options.missing, rng);
  const fallbackMeaning = resolveMeaning(fallbackOperation, options.divisionMeaning, rng);
  const fallbackPair = pickPair(chosen.family, rng);
  return generateTaskFromFamily(chosen.family, {
    operation: fallbackOperation,
    missing: fallbackMissing,
    divisionMeaning: fallbackMeaning,
    rng,
    swap: options.swap ?? "mix",
    pair: fallbackPair,
    squareSharedInput: squareMode === "single" && isSquare(fallbackPair) && fallbackMissing !== "product",
  });
}

function isSwapPair(a: Task, b: Task): boolean {
  if (a.operation !== "mul" || b.operation !== "mul") return false;
  if (a.familyId !== b.familyId) return false;
  const [aL, aR] = a.pair;
  const [bL, bR] = b.pair;
  if (aL === aR) return false;
  return aL === bR && aR === bL;
}

function violatesSwapSpacing(task: Task, recentTasks: Task[], spacing: number): boolean {
  const window = recentTasks.slice(-spacing);
  return window.some(prev => isSwapPair(task, prev));
}
