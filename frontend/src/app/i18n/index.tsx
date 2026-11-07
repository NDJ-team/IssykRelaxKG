import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ru from "./ru";
import ky from "./ky";
import en from "./en";

export type Locale = "ru" | "ky" | "en";

const dictionaries: Record<Locale, Record<string, string>> = { ru, ky, en };

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "RU",
  ky: "KY",
  en: "EN",
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("issykrelax.locale");
      if (saved === "ru" || saved === "ky" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    try {
      window.localStorage.setItem("issykrelax.locale", locale);
    } catch {
      /* storage unavailable */
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return dictionaries[locale][key] ?? dictionaries.ru[key] ?? fallback ?? key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}
