"use client";

import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";

type StatementContent = { kicker: string; title: string[]; paragraphs: string[]; cta?: string };

type ManifestoProps = {
  /** Par défaut : manifeste homepage (t.manifesto). Passez la copie d'un univers pour une landing dédiée. */
  content?: StatementContent;
  ctaHref?: string;
};

/**
 * Bloc "prise de position" éditoriale — réutilisé pour le manifeste
 * de la homepage et pour l'intro de chaque landing page d'univers.
 */
export default function Manifesto({ content, ctaHref = "#contact" }: ManifestoProps) {
  const { t } = useLanguage();
  const c = content ?? t.manifesto;

  return (
    <section className="bg-ivoire px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto grid max-w-content gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <ScrollReveal>
            <p className="mb-5 font-sans text-xs uppercase tracking-widest2 text-bronze">{c.kicker}</p>
          </ScrollReveal>
          <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight text-noir sm:text-5xl lg:text-[3.4rem]">
            {c.title.map((line, i) => (
              <TitleWipe key={line} delay={0.05 + i * 0.12}>
                {line}
              </TitleWipe>
            ))}
          </h2>
        </div>

        <div className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7">
          {c.paragraphs.map((paragraph, i) => (
            <ScrollReveal key={paragraph} delay={i * 0.07}>
              <p
                className={`font-sans leading-relaxed text-noir/70 ${
                  i === 0 || i === 1 ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                {paragraph}
              </p>
            </ScrollReveal>
          ))}

          {c.cta ? (
            <ScrollReveal delay={c.paragraphs.length * 0.07}>
              <a
                href={ctaHref}
                className="group mt-2 inline-flex w-fit items-center gap-2 border-b border-noir/30 pb-1 font-sans text-xs uppercase tracking-widest2 text-noir/70 transition-colors duration-300 hover:border-bronze hover:text-bronze"
              >
                {c.cta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
