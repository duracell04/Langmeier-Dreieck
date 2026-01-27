import type {
  DivisionMeaning,
  MissingSlot,
  Operation,
  ProductFamily,
  Task,
} from "@triangle/types";

type Rng = () => number;

type MaybeMixed<T extends string> = T | "mix";

export interface GenerateTaskOptions {
  operation?: MaybeMixed<Operation>;
  missing?: MaybeMixed<MissingSlot>;
  divisionMeaning?: MaybeMixed<DivisionMeaning>;
  rng?: Rng;
  instanceId?: string;
  pair?: [number, number];
  swap?: "keep" | "swap" | "mix";
  squareSharedInput?: boolean;
}

export interface GenerateTaskFromFamiliesOptions extends GenerateTaskOptions {
  familyId?: string;
}

const DEFAULT_RNG: Rng = () => Math.random();

function pick<T>(items: T[], rng: Rng): T {
  if (items.length === 0) throw new Error("Cannot pick from empty list");
  const idx = Math.floor(rng() * items.length);
  return items[idx];
}

function normalizePair(pair: [number, number]): [number, number] {
  const [a, b] = pair;
  return a <= b ? [a, b] : [b, a];
}

function applySwap(pair: [number, number], swap: "keep" | "swap" | "mix", rng: Rng): [number, number] {
  const [a, b] = pair;
  if (a === b) return [a, b];
  if (swap === "swap") return [b, a];
  if (swap === "mix") return rng() < 0.5 ? [a, b] : [b, a];
  return [a, b];
}

function randomId(rng: Rng): string {
  return Math.floor(rng() * 1e12).toString(36).padStart(8, "0");
}

function resolveOperation(op: MaybeMixed<Operation> | undefined, rng: Rng): Operation {
  if (!op || op === "mix") return rng() < 0.5 ? "mul" : "div";
  return op;
}

function resolveMissing(op: Operation, missing: MaybeMixed<MissingSlot> | undefined, rng: Rng): MissingSlot {
  if (missing && missing !== "mix") return missing;
  if (op === "div") return rng() < 0.5 ? "left" : "right";
  const pool: MissingSlot[] = ["product", "left", "right"];
  return pick(pool, rng);
}

function resolveMeaning(
  op: Operation,
  meaning: MaybeMixed<DivisionMeaning> | undefined,
  rng: Rng
): DivisionMeaning | undefined {
  if (op !== "div") return undefined;
  if (meaning && meaning !== "mix") return meaning;
  return rng() < 0.5 ? "quotitive" : "partitive";
}

export function buildTaskKey(input: {
  familyId: string;
  operation: Operation;
  pair: [number, number];
  missing: MissingSlot;
  divisionMeaning?: DivisionMeaning;
  squareSharedInput?: boolean;
}): string {
  const [a, b] = input.pair;
  const [na, nb] = normalizePair(input.pair);
  const orientation = a === b ? "same" : a === na && b === nb ? "base" : "swap";
  const meaning = input.divisionMeaning ?? "none";
  const square = input.squareSharedInput ? "square:shared" : "square:default";
  return `${input.familyId}|${input.operation}|${na}x${nb}|order:${orientation}|missing:${input.missing}|meaning:${meaning}|${square}`;
}

export function generateTaskFromFamily(
  family: ProductFamily,
  options: GenerateTaskOptions = {}
): Task {
  const rng = options.rng ?? DEFAULT_RNG;
  const basePair = options.pair ?? pick(family.factorPairs, rng);
  const normalizedPair = normalizePair(basePair);
  const pair = applySwap(normalizedPair, options.swap ?? "mix", rng);
  const operation = resolveOperation(options.operation, rng);
  const missing = resolveMissing(operation, options.missing, rng);
  const divisionMeaning = resolveMeaning(operation, options.divisionMeaning, rng);

  const [leftValue, rightValue] = pair;
  const productValue = leftValue * rightValue;

  let product: number | null = productValue;
  let left: number | null = leftValue;
  let right: number | null = rightValue;

  if (missing === "product") product = null;
  if (missing === "left") left = null;
  if (missing === "right") right = null;

  const taskKey = buildTaskKey({
    familyId: family.id,
    operation,
    pair,
    missing,
    divisionMeaning,
    squareSharedInput: options.squareSharedInput,
  });

  return {
    instanceId: options.instanceId ?? `${taskKey}|${randomId(rng)}`,
    taskKey,
    familyId: family.id,
    operation,
    pair,
    missing,
    divisionMeaning,
    squareSharedInput: options.squareSharedInput,
    product,
    left,
    right,
  };
}

export function generateTaskFromFamilies(
  families: ProductFamily[],
  options: GenerateTaskFromFamiliesOptions = {}
): Task {
  if (families.length === 0) throw new Error("No ProductFamilies available");
  const rng = options.rng ?? DEFAULT_RNG;
  const family = options.familyId
    ? families.find(f => f.id === options.familyId)
    : pick(families, rng);
  if (!family) throw new Error("Unknown ProductFamily id");
  return generateTaskFromFamily(family, options);
}

export function parseProductFamilies(json: unknown): ProductFamily[] {
  if (!Array.isArray(json)) throw new Error("ProductFamilies JSON must be an array");

  return json.map((raw, idx) => {
    if (!raw || typeof raw !== "object") throw new Error(`Invalid family at index ${idx}`);
    const item = raw as any;

    if (typeof item.id !== "string") throw new Error(`Family id missing at index ${idx}`);
    if (typeof item.product !== "number") throw new Error(`Family product missing at index ${idx}`);
    if (!Array.isArray(item.factorPairs)) throw new Error(`factorPairs missing at index ${idx}`);

    const factorPairs = item.factorPairs.map((pair: any, pIdx: number) => {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error(`Invalid factorPair at index ${idx}:${pIdx}`);
      }
      const [a, b] = pair;
      if (typeof a !== "number" || typeof b !== "number") {
        throw new Error(`Invalid factorPair numbers at index ${idx}:${pIdx}`);
      }
      return normalizePair([a, b]);
    });

    const tags = Array.isArray(item.tags) ? item.tags.filter((t: any) => typeof t === "string") : undefined;
    const canonicalPair = Array.isArray(item.canonicalPair) && item.canonicalPair.length === 2
      ? normalizePair([item.canonicalPair[0], item.canonicalPair[1]])
      : undefined;

    return {
      id: item.id,
      product: item.product,
      factorPairs,
      tags,
      canonicalPair,
    } as ProductFamily;
  });
}
