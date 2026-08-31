"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import MediaPlaceholder from "./MediaPlaceholder";
import { useLanguage } from "@/lib/LanguageContext";
import { universes as universeMeta } from "@/data/universes";

type ImageStatus = Record<string, boolean>;

/**
 * Sélecteur d'univers — la homepage doit permettre de choisir
 * immédiatement son secteur (Real Estate / Wedding & Venues /
 * Hospitality / Business), chacun avec son propre univers visuel.
 */
export default function UniverseChooser({ imageStatus }: { imageStatus: ImageStatus }) {
  const { t } = useLanguage();

  return (
    <section id="univers" className="bg-ivoire px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {t.universeChooser.kicker}
          </p>
        </ScrollReveal>
        <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight text-noir sm:text-5xl">
          {t.universeChooser.title.map((line, i) => (
            <TitleWipe key={line} delay={0.05 + i * 0.12}>
              {line}
            </TitleWipe>
          ))}
        </h2>
        <ScrollReveal delay={0.1}>
          <p className="mt-5 max-w-xl font-sans text-base text-noir/60 sm:text-lg">
            {t.universeChooser.subtitle}
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:mt-20 sm:grid-cols-2">
          {t.universeChooser.items.map((item, i) => {
            const meta = universeMeta.find((u) => u.id === item.id);
            const hasImage = Boolean(meta && imageStatus[meta.id]);

            return (
              <ScrollReveal key={item.id} delay={i * 0.06}>
                <a
                  href={meta?.path ?? "/"}
                  className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden bg-noir sm:aspect-[5/4]"
                >
                  {hasImage && meta ? (
                    <Image
                      src={meta.hero.poster}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.04]">
                      <MediaPlaceholder />
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/25 to-noir/10 transition-colors duration-500 group-hover:from-noir/95" />

                  <span className="frame-corner frame-corner--tl" aria-hidden />
                  <span className="frame-corner frame-corner--tr" aria-hidden />
                  <span className="frame-corner frame-corner--bl" aria-hidden />
                  <span className="frame-corner frame-corner--br" aria-hidden />

                  <div className="relative z-10 flex flex-col gap-3 p-6 sm:p-8">
                    <span className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                      {item.label}
                    </span>
                    <p className="max-w-xs font-sans text-sm leading-relaxed text-ivoire/70">{item.text}</p>
                    <span className="mt-2 inline-flex w-fit items-center gap-2 font-sans text-xs uppercase tracking-widest2 text-ivoire/85 transition-colors duration-300 group-hover:text-bronze">
                      {item.cta}
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </a>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
