"use client";

import type { ReactNode } from "react";
import { useUI } from "@/lib/UIContext";
import { useLang } from "@/lib/LanguageContext";
import type { L } from "@/data/site";

/** Bouton qui ouvre le film en plein écran, éventuellement à un instant précis. */
export default function FilmButton({
  children,
  className = "btn",
  start = 0,
  label,
}: {
  children: ReactNode;
  className?: string;
  start?: number;
  label?: L;
}) {
  const { openFilm } = useUI();
  const { t } = useLang();
  return (
    <button type="button" className={className} onClick={() => openFilm(start)} aria-label={label ? t(label) : undefined}>
      {children}
    </button>
  );
}
