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
}

function clamp10(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n)));
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
}: StructureLensGridProps) {
  const r = clamp10(rows);
  const c = clamp10(cols);

  const cell = 10;
  const fillWidth = c * cell;
  const fillHeight = r * cell;

  const label =
    ariaLabel ??
    (mode === "rect"
      ? `Strukturfeld: ${r} mal ${c}.`
      : `Strukturfeld: ${Math.min(100, Math.max(0, count ?? 0))} Felder.`);

  return (
    <div
      className={cn(
        "inline-flex rounded-swiss border border-grid-border bg-grid-bg p-1",
        "transition-opacity duration-fast ease-swiss",
        "motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden={!visible}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="w-structure-grid h-structure-grid block" aria-hidden="true">
        <rect x="0" y="0" width="100" height="100" className="fill-grid-bg" />

        {mode === "rect" ? (
          <>
            <rect x="0" y="0" width={fillWidth} height={fillHeight} className="fill-grid-fill" opacity="0.9" />
            <rect x="0" y="0" width={fillWidth} height={fillHeight} className="fill-focus" opacity="0.08" />
          </>
        ) : (
          Array.from({ length: Math.min(100, Math.max(0, count ?? 0)) }).map((_, i) => {
            const x = (i % 10) * cell;
            const y = Math.floor(i / 10) * cell;
            return <rect key={i} x={x} y={y} width={cell} height={cell} className="fill-grid-fill" opacity="0.9" />;
          })
        )}

        {outlineFilledRegion && mode === "rect" && r > 0 && c > 0 && (
          <rect
            x="0"
            y="0"
            width={fillWidth}
            height={fillHeight}
            fill="none"
            className="stroke-grid-border"
            strokeWidth="1"
            opacity="0.6"
          />
        )}

        {Array.from({ length: 9 }).map((_, i) => {
          const p = (i + 1) * cell;
          return (
            <React.Fragment key={p}>
              <line x1={p} y1={0} x2={p} y2={100} className="stroke-grid-border" strokeWidth="1" opacity="0.6" />
              <line x1={0} y1={p} x2={100} y2={p} className="stroke-grid-border" strokeWidth="1" opacity="0.6" />
            </React.Fragment>
          );
        })}

        <rect x="0" y="0" width="100" height="100" fill="none" className="stroke-grid-border" strokeWidth="1.5" />

        {highlight === "rows" && r > 0 && (
          <line x1={0} y1={0} x2={0} y2={fillHeight} className="stroke-focus" strokeWidth="2.5" />
        )}
        {highlight === "cols" && c > 0 && (
          <line x1={0} y1={0} x2={fillWidth} y2={0} className="stroke-focus" strokeWidth="2.5" />
        )}
      </svg>
    </div>
  );
}
