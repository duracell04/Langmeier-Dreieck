import React from "react";
import { useI18n } from "../i18n";

type LanguageToggleProps = {
  className?: string;
};

function joinClassNames(values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={joinClassNames([
        "inline-flex items-center rounded-full border border-border/60 bg-background text-xs uppercase",
        className,
      ])}
      role="group"
      aria-label="Language"
    >
      {(["de", "en"] as const).map(option => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            className={joinClassNames([
              "px-2.5 py-1 rounded-full transition-subtle",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            ])}
            onClick={() => setLocale(option)}
            aria-pressed={active}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
