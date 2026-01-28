import * as React from "react";
import { cn } from "../utils/cn";

export type KeypadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "backspace"
  | "enter"
  | "clear";

export interface KeypadProps {
  onKey: (key: KeypadKey) => void;
  disabled?: boolean;
  showEnter?: boolean;
  showClear?: boolean;
  className?: string;
}

function buildKeys({ showEnter, showClear }: Pick<KeypadProps, "showEnter" | "showClear">): KeypadKey[] {
  if (!showEnter) {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9", showClear ? "clear" : "backspace", "0", "backspace"];
  }
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "backspace", "0", "enter"];
}

export function Keypad({
  onKey,
  disabled = false,
  showEnter = true,
  showClear = false,
  className,
}: KeypadProps) {
  const keys = React.useMemo(() => buildKeys({ showEnter, showClear }), [showEnter, showClear]);

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)} role="group" aria-label="Tastatur">
      {keys.map(key => {
        const isAction = key === "backspace" || key === "enter" || key === "clear";
        const label = key === "backspace" ? "⌫" : key === "enter" ? "OK" : key === "clear" ? "AC" : key;
        const ariaLabel =
          key === "backspace"
            ? "Löschen"
            : key === "enter"
              ? "Bestätigen"
              : key === "clear"
                ? "Alles löschen"
                : `Zahl ${key}`;

        return (
          <button
            key={key}
            type="button"
            className={cn(
              "min-h-touch min-w-touch rounded-xl border border-border/60 bg-card text-2xl font-semibold text-foreground",
              "shadow-subtle",
              "transition-subtle focus-ring",
              "active:scale-95",
              "motion-reduce:transition-none motion-reduce:transform-none",
              isAction && "text-lg bg-secondary text-secondary-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => onKey(key)}
            disabled={disabled}
            aria-label={ariaLabel}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
