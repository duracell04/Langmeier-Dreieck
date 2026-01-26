import * as React from "react";
import { cn } from "../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "warning" | "info";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-grid-border text-muted",
  success: "border-status-success text-ink",
  warning: "border-status-warning text-ink",
  info: "border-status-info text-ink",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = "neutral", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-micro font-semibold uppercase tracking-wide",
        "bg-surface",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
