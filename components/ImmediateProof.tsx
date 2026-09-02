"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import MediaPlaceholder from "./MediaPlaceholder";
import { useLanguage } from "@/lib/LanguageContext";

type ImmediateProofProps = {
  /** Image "avant" — la photo source, telle quelle. */
  beforeSrc?: string;
  hasBefore: boolean;
  /** Vidéo "après" — le résultat Estalia. */
  afterSrc?: string;
  afterPoster?: string;
  hasAfter: boolean;
  hasAfterPoster: boolean;
};

/**
 * Section "preuve immédiate" — juste après le Hero. Explique Estalia sans
 * un paragraphe : une photo source à gauche, le résultat à droite. Tant
 * que les vrais démos ne sont pas produites (crédits Higgsfield), les deux
 * côtés affichent le même placeholder éditorial honnête que le reste du
 * site — jamais un visuel qui prétend être un résultat réel.
 */
export default function ImmediateProof({
  beforeSrc,
  hasBefore,
  afterSrc,
  afterPoster,
  hasAfter,
  hasAfterPoster,
}: ImmediateProofProps) {
  const { t } = useLanguage();
  const c = t.immediateProof;

  return (
    <section className="bg-ivoire px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{c.kicker}</p>
        </ScrollReveal>
        <h2 className="max-w-2xl font-serif text-3xl uppercase leading-[1.1] tracking-tight text-noir sm:text-4xl lg:text-5xl">
          {c.title.map((line, i) => (
            <TitleWipe key={line} delay={0.05 + i * 0.1}>
              {line}
            </TitleWipe>
          ))}
        </h2>

        <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6">
          <ScrollReveal delay={0.05}>
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir sm:aspect-square">
                {hasBefore && beforeSrc ? (
                  <Image src={beforeSrc} alt={c.beforeLabel} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <MediaPlaceholder tag={c.beforeLabel} />
                )}
              </div>
              <p className="font-sans text-[11px] uppercase tracking-widest2 text-noir/45">{c.beforeLabel}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir sm:aspect-square">
                {hasAfter && afterSrc ? (
                  <video
                    className="h-full w-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="none"
                    poster={hasAfterPoster ? afterPoster : undefined}
                  >
                    <source src={afterSrc} type="video/mp4" />
                  </video>
                ) : (
                  <MediaPlaceholder tag={c.afterLabel} />
                )}
              </div>
              <p className="font-sans text-[11px] uppercase tracking-widest2 text-bronze">{c.afterLabel}</p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2}>
          <p className="mt-8 max-w-lg font-sans text-sm leading-relaxed text-noir/55 sm:text-base">{c.caption}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
