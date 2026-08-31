"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroMedia from "./HeroMedia";
import { useLanguage } from "@/lib/LanguageContext";

const easing = [0.19, 1, 0.22, 1] as const;

type HeroContent = {
  kicker: string;
  title: string[];
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scroll?: string;
};

type HeroProps = {
  hasVideo: boolean;
  hasPoster: boolean;
  videoSrc?: string;
  posterSrc?: string;
  /** Par défaut : copie homepage (t.hero). Passez la copie d'un univers pour une landing dédiée. */
  content?: HeroContent;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
  sectionId?: string;
};

/**
 * Hero plein écran générique — réutilisé par la homepage (copie
 * universelle) et par chaque landing page d'univers (copie et médias
 * propres à Real Estate / Wedding & Venues / Hospitality / Business).
 */
export default function Hero({
  hasVideo,
  hasPoster,
  videoSrc,
  posterSrc,
  content,
  ctaPrimaryHref = "#films",
  ctaSecondaryHref = "#contact",
  sectionId = "top",
}: HeroProps) {
  const { t } = useLanguage();
  const c = content ?? t.hero;
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax très léger : le fond dérive plus lentement que le premier
  // plan pendant le scroll de sortie du Hero — profondeur de champ,
  // pas d'effet gadget.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="grain relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-noir"
    >
      <motion.div className="absolute inset-0" style={{ y: mediaY }}>
        <HeroMedia hasVideo={hasVideo} hasPoster={hasPoster} videoSrc={videoSrc} posterSrc={posterSrc} />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/55 via-noir/25 to-noir/80" />
      </motion.div>

      <div className="relative z-10 w-full px-6 pb-16 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-content">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.2 }}
            className="mb-6 font-sans text-xs uppercase tracking-widest3 text-ivoire/80 sm:mb-8"
          >
            {c.kicker}
          </motion.p>

          <h1 className="max-w-4xl font-serif text-[2.6rem] uppercase leading-[1.05] tracking-tight text-ivoire sm:text-6xl lg:text-7xl">
            {c.title.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, y: 8 }}
                  animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: easing, delay: 0.35 + i * 0.16 }}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.7 }}
            className="mt-7 max-w-md font-sans text-sm leading-relaxed text-ivoire/75 sm:mt-8 sm:max-w-lg sm:text-base"
          >
            {c.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.85 }}
            className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-6"
          >
            <a
              href={ctaPrimaryHref}
              className="group inline-flex items-center justify-center gap-2 border border-ivoire px-7 py-4 text-center font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir"
            >
              {c.ctaPrimary}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href={ctaSecondaryHref}
              className="group inline-flex items-center justify-center gap-2 border border-ivoire/35 px-7 py-4 text-center font-sans text-xs uppercase tracking-widest2 text-ivoire/85 transition-colors duration-300 hover:border-ivoire hover:text-ivoire"
            >
              {c.ctaSecondary}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
        aria-hidden
      >
        <span className="font-sans text-[10px] uppercase tracking-widest2 text-ivoire/60">
          {c.scroll ?? t.hero.scroll}
        </span>
        <span className="h-10 w-px overflow-hidden bg-ivoire/25">
          <span className="block h-full w-full animate-[scrollLine_2.2s_ease-in-out_infinite] bg-ivoire/70" />
        </span>
      </motion.div>
    </section>
  );
}
