import type { DivisionMeaning, MissingSlot, Operation, ProductFamily, Task } from "@triangle/types";
import { generateTaskFromFamily } from "./generateTask";

export interface LearnTaskBlueprint {
  familyId: string;
  pair: [number, number];
  operation: Operation;
  missing: MissingSlot;
  divisionMeaning?: DivisionMeaning;
  swap?: "keep" | "swap";
  squareSharedInput?: boolean;
}

export interface LearnPlanOptions {
  divisionEnabled?: boolean;
  squareMode?: "default" | "single";
}

function isSquare(pair: [number, number]): boolean {
  return pair[0] === pair[1];
}

export function buildLearnPlan(families: ProductFamily[], options: LearnPlanOptions = {}): LearnTaskBlueprint[] {
  const divisionEnabled = options.divisionEnabled ?? true;
  const squareMode = options.squareMode ?? "default";

  const plan: LearnTaskBlueprint[] = [];
  const sortedFamilies = [...families].sort((a, b) => a.product - b.product);

  for (const family of sortedFamilies) {
    const pairs = [...family.factorPairs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (const pair of pairs) {
      const square = isSquare(pair);

      plan.push({ familyId: family.id, pair, operation: "mul", missing: "product", swap: "keep" });
      if (!square) {
        plan.push({ familyId: family.id, pair, operation: "mul", missing: "product", swap: "swap" });
      }

      const squareShared = square && squareMode === "single";
      plan.push({
        familyId: family.id,
        pair,
        operation: "mul",
        missing: "left",
        swap: "keep",
        squareSharedInput: squareShared,
      });
      if (!squareShared) {
        plan.push({ familyId: family.id, pair, operation: "mul", missing: "right", swap: "keep" });
      }

      if (divisionEnabled && family.product !== 0) {
        plan.push({
          familyId: family.id,
          pair,
          operation: "div",
          missing: "right",
          divisionMeaning: "quotitive",
          swap: "keep",
        });
        plan.push({
          familyId: family.id,
          pair,
          operation: "div",
          missing: "left",
          divisionMeaning: "partitive",
          swap: "keep",
        });
      }
    }
  }

  return plan;
}

export function taskFromBlueprint(
  families: ProductFamily[],
  blueprint: LearnTaskBlueprint,
  rng?: () => number
): Task {
  const family = families.find(item => item.id === blueprint.familyId);
  if (!family) throw new Error("Unknown ProductFamily id");

  return generateTaskFromFamily(family, {
    operation: blueprint.operation,
    missing: blueprint.missing,
    divisionMeaning: blueprint.divisionMeaning,
    pair: blueprint.pair,
    swap: blueprint.swap ?? "keep",
    squareSharedInput: blueprint.squareSharedInput,
    rng,
  });
}
