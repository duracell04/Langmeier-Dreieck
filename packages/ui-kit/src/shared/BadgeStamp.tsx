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
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-ink",
        className
      )}
    >
      <span className="font-semibold">{label}</span>
      {isNew ? (
        <span className="rounded-full bg-bg px-2 py-0.5 text-micro text-muted" aria-label="Neu">
          Neu
        </span>
      ) : null}
    </div>
  );
}
