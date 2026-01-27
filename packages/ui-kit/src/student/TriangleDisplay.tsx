import * as React from "react";
import { cn } from "../utils/cn";

export type TriangleSlot = "product" | "factorA" | "factorB";
export type TriangleStatus = "idle" | "success" | "error" | "hint";
export type TriangleOperation = "mul" | "div";

export interface TriangleDisplayProps {
  product: React.ReactNode;
  factorA: React.ReactNode;
  factorB: React.ReactNode;
  missingSlot: TriangleSlot;
  lockedSlots?: TriangleSlot[];
  operation?: TriangleOperation;
  status?: TriangleStatus;
  ariaLabel?: string;
  className?: string;
}

function nodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  return "";
}

export const TriangleDisplay = React.forwardRef<HTMLDivElement, TriangleDisplayProps>(
  (
    {
      product,
      factorA,
      factorB,
      missingSlot,
      lockedSlots = [],
      operation = "mul",
      status = "idle",
      ariaLabel,
      className,
    },
    ref
  ) => {
    const opSymbol = operation === "mul" ? "\u00D7" : "\u00F7";

    const isLocked = (slot: TriangleSlot) => lockedSlots.includes(slot);
    const isMissing = (slot: TriangleSlot) => missingSlot === slot;

    const statusRing =
      status === "success"
        ? "ring-2 ring-status-success"
        : status === "error"
          ? "ring-2 ring-status-error"
          : status === "hint"
            ? "ring-2 ring-status-warning"
            : "";

    const slotClass = (slot: TriangleSlot, variant: "product" | "factor") =>
      cn(
        "triangle-node",
        isMissing(slot) ? "triangle-node-missing" : variant === "product" ? "triangle-node-product" : "triangle-node-factor",
        isLocked(slot) && "opacity-70 border-dashed text-muted-foreground",
        isMissing(slot) && statusRing,
        isMissing(slot) && "ring-offset-2 ring-offset-bg"
      );

    const label =
      ariaLabel ??
      `Triangle: product ${nodeToText(product) || "?"}, factors ${nodeToText(factorA) || "?"} ${opSymbol} ${
        nodeToText(factorB) || "?"
      }.`;

    return (
      <div
        ref={ref}
        className={cn("triangle-container", className)}
        role="img"
        aria-label={label}
        data-status={status}
      >
        <div className={slotClass("product", "product")}>{product}</div>

        <svg className="w-24 h-6 text-border" viewBox="0 0 96 24" fill="none" aria-hidden="true">
          <path d="M48 0 L16 24 M48 0 L80 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <div className="flex items-center gap-8">
          <div className={slotClass("factorA", "factor")}>{factorA}</div>
          <div className={slotClass("factorB", "factor")}>{factorB}</div>
        </div>

        <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
          <span className={cn(operation === "mul" && "text-primary font-medium")}>{"\u00D7"}</span>
          <span className={cn(operation === "div" && "text-primary font-medium")}>{"\u00F7"}</span>
        </div>
      </div>
    );
  }
);

TriangleDisplay.displayName = "TriangleDisplay";
