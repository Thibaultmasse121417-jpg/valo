"use client";

import type { ReactNode } from "react";
import { useUI } from "@/lib/UIContext";
import type { ProjectType } from "@/data/site";

/**
 * Lien « Demander un devis » : descend au formulaire de la page et le
 * pré-remplit (formule choisie, métier d'où vient le visiteur).
 * Sur une page sans formulaire, `href="/#contact"` ramène à l'accueil.
 */
export default function QuoteLink({
  children,
  className = "btn btn--solid",
  type,
  context,
  href = "#contact",
}: {
  children: ReactNode;
  className?: string;
  type?: ProjectType;
  context?: string;
  href?: string;
}) {
  const { setQuote } = useUI();
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        if (type || context) setQuote({ type, context });
      }}
    >
      {children}
    </a>
  );
}
