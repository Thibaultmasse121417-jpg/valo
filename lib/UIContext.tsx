"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ProjectType } from "@/data/site";

type Viewer =
  | { kind: "film"; start: number }
  | { kind: "image"; src: string; alt: string; caption: string }
  | null;

type Quote = { type?: ProjectType; context?: string };

type UIContextValue = {
  viewer: Viewer;
  openFilm: (start?: number) => void;
  openImage: (src: string, alt: string, caption: string) => void;
  closeViewer: () => void;
  quote: Quote;
  /** pré-remplit le formulaire de devis (formule, métier d'où vient le visiteur) */
  setQuote: (q: Quote) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<Viewer>(null);
  const [quote, setQuoteState] = useState<Quote>({});

  const openFilm = useCallback((start = 0) => setViewer({ kind: "film", start }), []);
  const openImage = useCallback((src: string, alt: string, caption: string) => setViewer({ kind: "image", src, alt, caption }), []);
  const closeViewer = useCallback(() => setViewer(null), []);
  // ne remplace que ce qui est fourni : choisir une formule ne fait pas oublier le métier
  const setQuote = useCallback(
    (q: Quote) =>
      setQuoteState((cur) => ({ type: q.type ?? cur.type, context: q.context ?? cur.context })),
    []
  );

  return (
    <UIContext.Provider value={{ viewer, openFilm, openImage, closeViewer, quote, setQuote }}>{children}</UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
