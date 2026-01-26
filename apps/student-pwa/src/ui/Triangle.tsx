import React from "react";
import {
  TriangleDisplay,
  type TriangleOperation,
  type TriangleSlot,
  type TriangleStatus,
} from "@triangle/ui-kit";

type Slot = "product" | "left" | "right";

export interface TriangleProps {
  product: string;
  left: string;
  right: string;
  missing: Slot;
  lockedSlots?: Slot[];
  operation?: TriangleOperation;
  status?: TriangleStatus;
}

const slotMap: Record<Slot, TriangleSlot> = {
  product: "product",
  left: "factorA",
  right: "factorB",
};

export function Triangle({
  product,
  left,
  right,
  missing,
  lockedSlots = [],
  operation = "mul",
  status = "idle",
}: TriangleProps) {
  return (
    <TriangleDisplay
      product={product}
      factorA={left}
      factorB={right}
      missingSlot={slotMap[missing]}
      lockedSlots={lockedSlots.map(slot => slotMap[slot])}
      operation={operation}
      status={status}
    />
  );
}
