import * as React from "react";
import { cn } from "../utils/cn";

export type GridMode = "rect" | "count";
export type GridHighlight = "rows" | "cols" | "none";

export interface StructureLensGridProps {
  rows: number;
  cols: number;
  mode?: GridMode;
  count?: number;
  highlight?: GridHighlight;
  visible?: boolean;
  className?: string;
  ariaLabel?: string;
  outlineFilledRegion?: boolean;
  showNumbers?: boolean;
  gridSize?: number;
}

function clamp(n: number, max = 10): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

export function StructureLensGrid({
  rows,
  cols,
  mode = "rect",
  count,
  highlight = "none",
  visible = true,
  className,
  ariaLabel,
  outlineFilledRegion = false,
  showNumbers = false,
  gridSize = 10,
}: StructureLensGridProps) {
  const size = Math.max(1, Math.min(10, Math.round(gridSize)));
  const r = Math.min(size, clamp(rows, size));
  const c = Math.min(size, clamp(cols, size));
  const total = size * size;
  const safeCount = clamp(count ?? 0, total);

  const label =
    ariaLabel ??
    (mode === "rect"
      ? `Strukturfeld: ${r} mal ${c}.`
      : `Strukturfeld: ${Math.min(total, Math.max(0, count ?? 0))} Felder.`);

  const isActive = (row: number, col: number, index: number) =>
    mode === "count" ? index < safeCount : row < r && col < c;

  const highlightCell = (row: number, col: number) => {
    if (highlight === "none") return false;
    if (highlight === "rows") return row < r;
    return col < c;
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-0.5 transition-subtle",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden={!visible}
      role="img"
      aria-label={label}
    >
      {showNumbers ? (
        <div className="flex gap-0.5 mb-1">
          <div className="grid-cell" />
          {Array.from({ length: size }, (_, i) => (
            <div key={`header-${i + 1}`} className="grid-cell text-muted-foreground/70 font-medium">
              {i + 1}
            </div>
          ))}
        </div>
      ) : null}

      {Array.from({ length: size }, (_, row) => (
        <div key={`row-${row + 1}`} className="flex gap-0.5">
          {showNumbers ? (
            <div className="grid-cell text-muted-foreground/70 font-medium">{row + 1}</div>
          ) : null}
          {Array.from({ length: size }, (_, col) => {
            const index = row * size + col;
            const active = isActive(row, col, index);
            const highlightClass = highlightCell(row, col) && active ? "ring-1 ring-primary/30" : "";
            const outlineClass = outlineFilledRegion && active ? "ring-1 ring-primary/40" : "";
            return (
              <div
                key={`cell-${row + 1}-${col + 1}`}
                className={cn(
                  "grid-cell",
                  active ? "grid-cell-active" : "grid-cell-inactive",
                  highlightClass,
                  outlineClass
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
