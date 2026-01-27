import * as React from "react";
import { cn } from "../utils/cn";

export type FeedbackState = "solve" | "wrong1" | "structure" | "success" | "reveal";

export interface FeedbackLadderProps {
  state: FeedbackState;
  message?: string;
  detail?: string;
  className?: string;
}

const toneClasses: Record<Exclude<FeedbackState, "solve">, string> = {
  success: "border-status-success",
  wrong1: "border-status-warning",
  structure: "border-status-info",
  reveal: "border-status-info",
};

export function FeedbackLadder({ state, message, detail, className }: FeedbackLadderProps) {
  if (state === "solve" && !message && !detail) return null;

  const tone = state === "solve" ? "border-grid-border" : toneClasses[state];

  return (
    <div
      className={cn(
        "w-full max-w-xl rounded-swiss border bg-surface px-4 py-3 text-center",
        "transition duration-fast ease-swiss",
        "motion-reduce:transition-none",
        tone,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message ? <div className="text-sm font-semibold text-ink">{message}</div> : null}
      {detail ? <div className="text-micro text-muted">{detail}</div> : null}
    </div>
  );
}
