"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { L } from "@/data/site";

export type Locale = "fr" | "en";

type LanguageContextValue = {
  locale: Locale;
  toggleLocale: () => void;
  /** texte de la langue active — pour les attributs (aria-label, alt, placeholder) */
  t: (text: L) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "estalia-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Le français est la langue principale : c'est lui que le serveur rend
  // (et que les moteurs de recherche lisent). L'anglais n'apparaît que si
  // le visiteur l'a choisi avec le sélecteur.
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "en") setLocale("en");
    } catch {
      // stockage indisponible (navigation privée) : on reste en français
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((current) => {
      const next = current === "fr" ? "en" : "fr";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t = useCallback((text: L) => text[locale], [locale]);

  return <LanguageContext.Provider value={{ locale, toggleLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

/** Affiche le texte de la langue active. Utilisable depuis un composant serveur. */
export function T({ fr, en }: { fr: ReactNode; en: ReactNode }) {
  const { locale } = useLang();
  return <>{locale === "en" ? en : fr}</>;
}
