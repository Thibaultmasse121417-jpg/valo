"use client";

import { motion } from "framer-motion";
import HeroMedia from "./HeroMedia";
import { useLanguage } from "@/lib/LanguageContext";

const easing = [0.19, 1, 0.22, 1] as const;

export default function Hero({
  hasVideo,
  hasPoster,
}: {
  hasVideo: boolean;
  hasPoster: boolean;
}) {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-noir"
    >
      <div className="absolute inset-0">
        <HeroMedia hasVideo={hasVideo} hasPoster={hasPoster} />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/55 via-noir/25 to-noir/80" />
      </div>

      <div className="relative z-10 w-full px-6 pb-16 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
        <div className="mx-auto max-w-content">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.2 }}
            className="mb-6 font-sans text-xs uppercase tracking-widest3 text-ivoire/80 sm:mb-8"
          >
            {t.hero.kicker}
          </motion.p>

          <h1 className="max-w-4xl font-serif text-[2.6rem] uppercase leading-[1.05] tracking-wide text-ivoire sm:text-6xl lg:text-7xl">
            {t.hero.title.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: easing, delay: 0.35 + i * 0.12 }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.7 }}
            className="mt-7 max-w-md font-sans text-sm leading-relaxed text-ivoire/75 sm:mt-8 sm:max-w-lg sm:text-base"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easing, delay: 0.85 }}
            className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-6"
          >
            <a
              href="#films"
              className="border border-ivoire px-7 py-4 text-center font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#contact"
              className="border border-ivoire/35 px-7 py-4 text-center font-sans text-xs uppercase tracking-widest2 text-ivoire/85 transition-colors duration-300 hover:border-ivoire hover:text-ivoire"
            >
              {t.hero.ctaSecondary}
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
          {t.hero.scroll}
        </span>
        <span className="h-10 w-px overflow-hidden bg-ivoire/25">
          <span className="block h-full w-full animate-[scrollLine_2.2s_ease-in-out_infinite] bg-ivoire/70" />
        </span>
      </motion.div>
    </section>
  );
}
