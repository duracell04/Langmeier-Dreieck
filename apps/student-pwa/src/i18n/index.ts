import React from "react";
import { messages, type Locale } from "./messages";

type MessageValue = string | number | boolean | Record<string, unknown> | Array<unknown>;

const STORAGE_KEY = "triangle-lang";
const FALLBACK_LOCALE: Locale = "en";

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return FALLBACK_LOCALE;
  const raw = navigator.languages?.[0] ?? navigator.language ?? "";
  return raw.toLowerCase().startsWith("de") ? "de" : "en";
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return FALLBACK_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "de" || stored === "en") return stored;
  return getBrowserLocale();
}

function resolvePath(source: Record<string, any>, path: string): MessageValue | undefined {
  return path.split(".").reduce<MessageValue | undefined>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, MessageValue>)[key];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = params[key];
    return value === undefined ? "" : String(value);
  });
}

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tList: <T = string>(key: string) => T[];
};

const I18nContext = React.createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => getInitialLocale());

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const getValue = React.useCallback(
    (key: string) =>
      resolvePath(messages[locale] as Record<string, any>, key) ??
      resolvePath(messages[FALLBACK_LOCALE] as Record<string, any>, key),
    [locale]
  );

  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = getValue(key);
      if (typeof value !== "string") return key;
      return interpolate(value, params);
    },
    [getValue]
  );

  const tList = React.useCallback(
    <T,>(key: string): T[] => {
      const value = getValue(key);
      return Array.isArray(value) ? (value as T[]) : [];
    },
    [getValue]
  );

  const contextValue = React.useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t,
      tList,
    }),
    [locale, setLocale, t, tList]
  );

  return React.createElement(I18nContext.Provider, { value: contextValue }, children);
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
