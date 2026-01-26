import * as React from "react";

export interface SessionStreakProps {
  streak: number;
  showFrom?: number;
  ariaLabel?: string;
}

export function SessionStreak({ streak, showFrom = 2, ariaLabel }: SessionStreakProps) {
  const shouldShow = streak >= showFrom;

  if (!shouldShow) {
    return <span className="inline-flex min-w-touch" aria-hidden="true" />;
  }

  const label = ariaLabel ?? `Serie: ${streak}`;

  return (
    <span className="inline-flex min-w-touch items-center justify-end text-sm text-muted" aria-label={label}>
      <span className="font-semibold">{"\u2022"} {streak}</span>
    </span>
  );
}
