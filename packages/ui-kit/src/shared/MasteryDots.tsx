import * as React from "react";
import { cn } from "../utils/cn";

export interface MasteryDotsProps {
  level: 0 | 1 | 2 | 3;
  size?: "sm" | "md";
  pulseOnUpgrade?: boolean;
  reducedMotion?: boolean;
}

const sizeClasses: Record<NonNullable<MasteryDotsProps["size"]>, string> = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
};

export function MasteryDots({
  level,
  size = "sm",
  pulseOnUpgrade = false,
  reducedMotion = false,
}: MasteryDotsProps) {
  const pulse = pulseOnUpgrade && !reducedMotion;
  const pulseStyle: React.CSSProperties | undefined = pulse
    ? { animationDuration: "600ms", animationIterationCount: 1 }
    : undefined;

  return (
    <div className="inline-flex items-center gap-1" role="img" aria-label={`Mastery ${level} von 3`}>
      {Array.from({ length: 3 }, (_, idx) => {
        const filled = idx < level;
        return (
          <span
            key={idx}
            className={cn(
              "rounded-full border border-border",
              sizeClasses[size],
              filled ? "bg-ink" : "bg-surface",
              pulse && filled && "animate-pulse",
              "motion-reduce:animate-none"
            )}
            style={pulse && filled ? pulseStyle : undefined}
          />
        );
      })}
    </div>
  );
}
