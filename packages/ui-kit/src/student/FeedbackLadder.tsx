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
  success: "border-status-success bg-status-success/10",
  wrong1: "border-status-warning bg-status-warning/10",
  structure: "border-status-info bg-status-info/10",
  reveal: "border-status-info bg-status-info/10",
};

export function FeedbackLadder({ state, message, detail, className }: FeedbackLadderProps) {
  if (state === "solve" && !message && !detail) return null;

  const tone = state === "solve" ? "border-border/50 bg-card" : toneClasses[state];

  return (
    <div
      className={cn(
        "w-full max-w-xl rounded-lg border px-4 py-3 text-center shadow-subtle",
        "transition-subtle",
        tone,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {message ? <div className="text-sm font-semibold text-foreground">{message}</div> : null}
      {detail ? <div className="text-xs text-muted-foreground">{detail}</div> : null}
    </div>
  );
}
