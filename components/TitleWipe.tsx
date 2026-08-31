"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const easing = [0.19, 1, 0.22, 1] as const;

/**
 * Révélation "rideau" pour les grands titres : chaque ligne se dévoile
 * de gauche à droite au scroll, comme un carton-titre de film — plus
 * cinématographique qu'un simple fondu, sans jamais devenir une
 * animation spectaculaire (une seule direction, un seul passage).
 */
export default function TitleWipe({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, y: 8 }}
        whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 1, ease: easing, delay }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}
