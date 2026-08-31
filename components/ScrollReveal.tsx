"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Décalage vertical de départ en pixels — reste volontairement discret. */
  y?: number;
  as?: "div" | "span";
};

const buildVariants = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] },
  },
});

/**
 * Fait apparaître son contenu au scroll avec un fondu + très léger
 * déplacement vertical. Volontairement sobre : aucune rotation, aucun
 * rebond, aucun effet spectaculaire.
 */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: ScrollRevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ delay }}
      variants={buildVariants(y)}
    >
      {children}
    </Component>
  );
}
