import * as React from "react";
import { cn } from "../utils/cn";

export type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "backspace" | "enter";

export interface KeypadProps {
  onKey: (key: KeypadKey) => void;
  disabled?: boolean;
  className?: string;
}

const KEYS: KeypadKey[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "backspace",
  "0",
  "enter",
];

export function Keypad({ onKey, disabled = false, className }: KeypadProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)} role="group" aria-label="Tastatur">
      {KEYS.map(key => {
        const isAction = key === "backspace" || key === "enter";
        const label = key === "backspace" ? "Del" : key === "enter" ? "OK" : key;
        const ariaLabel =
          key === "backspace" ? "Loeschen" : key === "enter" ? "Bestaetigen" : `Zahl ${key}`;

        return (
          <button
            key={key}
            type="button"
            className={cn(
              "min-h-touch min-w-touch rounded-lg border border-border/60 bg-card text-2xl font-semibold text-foreground",
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
