import * as React from "react";
import type { BadgeId } from "@triangle/types";
import { cn } from "../utils/cn";

export interface BadgeStampProps {
  id: BadgeId;
  label: string;
  isNew?: boolean;
  className?: string;
}

export function BadgeStamp({ label, isNew = false, className }: BadgeStampProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-3 py-1 text-sm text-foreground",
        className
      )}
    >
      <span className="font-semibold">{label}</span>
      {isNew ? (
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground" aria-label="Neu">
          Neu
        </span>
      ) : null}
    </div>
  );
}

