import { Fragment, type ReactNode } from "react";
import type { Line } from "@/data/site";

/** `*mot*` → <em>mot</em>. Pas de HTML brut dans le contenu. */
export function rich(text: string): ReactNode {
  const parts = text.split("*");
  return parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>));
}

/** Titre composé : une ligne par entrée, avec ses décalages éventuels. */
export function lines(ls: Line[]): ReactNode {
  return ls.map((ln, i) => (
    <span key={i} className={`tl${ln.c ? ` ${ln.c}` : ""}`}>
      {rich(ln.t)}
    </span>
  ));
}
