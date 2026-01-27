// packages/types/src/domain/Task.ts
export type Operation = "mul" | "div";
export type MissingSlot = "product" | "left" | "right";
export type DivisionMeaning = "quotitive" | "partitive";

export interface Task {
  instanceId: string;   // per occurrence (UI)
  taskKey: string;      // deterministic aggregation key
  familyId: string;
  operation: Operation;
  pair: [number, number];
  missing: MissingSlot;
  divisionMeaning?: DivisionMeaning;
  squareSharedInput?: boolean;

  product: number | null;
  left: number | null;
  right: number | null;
}
