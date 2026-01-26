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
    const opSymbol = operation === "mul" ? "×" : "÷";

    const isLocked = (slot: TriangleSlot) => lockedSlots.includes(slot);
    const isMissing = (slot: TriangleSlot) => missingSlot === slot;

    const missingBorder =
      status === "success"
        ? "border-status-success"
        : status === "error"
          ? "border-status-error"
          : "border-focus";

    const missingRing =
      status === "success"
        ? "ring-status-success"
        : status === "error"
          ? "ring-status-error"
          : "ring-focus";

    const slotBase =
      "min-w-touch min-h-touch px-3 py-2 rounded-swiss border bg-surface " +
      "tabular-nums text-center flex items-center justify-center select-none";

    const slotClass = (slot: TriangleSlot) =>
      cn(
        slotBase,
        "border-grid-border",
        isLocked(slot) && "opacity-70 border-dashed text-muted",
        isMissing(slot) &&
          cn("border-2", missingBorder, "ring-2", missingRing, "ring-offset-2 ring-offset-surface"),
        status === "hint" && isMissing(slot) && "ring-2 ring-focus"
      );

    const label =
      ariaLabel ??
      `Triangle: product ${nodeToText(product) || "?"}, factors ${nodeToText(factorA) || "?"} ${opSymbol} ${
        nodeToText(factorB) || "?"
      }.`;

    return (
      <div
        ref={ref}
        className={cn("relative w-full max-w-triangle aspect-square", className)}
        role="img"
        aria-label={label}
        data-status={status}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full text-grid-border pointer-events-none"
          aria-hidden="true"
        >
          <polygon points="50,8 92,92 8,92" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        </svg>

        <div className="absolute inset-0 grid grid-rows-2 grid-cols-3 items-center justify-items-center p-5">
          <div className="row-start-1 col-span-3 flex flex-col items-center justify-center">
            <div className={cn(slotClass("product"), "text-product font-semibold text-ink")}>{product}</div>
          </div>

          <div className="row-start-2 col-start-1">
            <div className={cn(slotClass("factorA"), "text-factor font-semibold text-ink-2")}>{factorA}</div>
          </div>

          <div className="row-start-2 col-start-2">
            <div className="text-operator font-semibold text-muted">{opSymbol}</div>
          </div>

          <div className="row-start-2 col-start-3">
            <div className={cn(slotClass("factorB"), "text-factor font-semibold text-ink-2")}>{factorB}</div>
          </div>
        </div>
      </div>
    );
  }
);

TriangleDisplay.displayName = "TriangleDisplay";
