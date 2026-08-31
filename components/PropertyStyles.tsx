"use client";

import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";

export default function PropertyStyles() {
  const { t } = useLanguage();

  return (
    <section className="bg-ivoire px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
              {t.styles.kicker}
            </p>
          </ScrollReveal>
          <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight text-noir sm:text-5xl">
            {t.styles.title.map((line, i) => (
              <TitleWipe key={line} delay={0.05 + i * 0.12}>
                {line}
              </TitleWipe>
            ))}
          </h2>
        </div>

        <div className="mt-16 grid gap-14 sm:mt-20 lg:grid-cols-3 lg:gap-10">
          {t.styles.columns.map((column, i) => (
            <ScrollReveal key={column.title} delay={i * 0.08}>
              <div className="flex h-full flex-col border-t border-noir/15 pt-7">
                <h3 className="font-serif text-2xl uppercase tracking-tight text-noir">
                  {column.title}
                </h3>
                <ol className="mt-7 flex flex-col gap-4">
                  {column.beats.map((beat, beatIndex) => (
                    <li key={beat} className="flex gap-4 font-sans text-sm text-noir/65">
                      <span className="mt-0.5 font-serif text-xs text-bronze">
                        {String(beatIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed">{beat}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <figure className="relative mx-auto mt-24 max-w-2xl border-t border-noir/15 pt-10 text-center sm:mt-28">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[58%] font-serif text-6xl leading-none text-bronze/35 sm:text-7xl"
            >
              &ldquo;
            </span>
            <blockquote className="font-serif text-xl italic leading-snug tracking-tight text-noir sm:text-3xl">
              {t.styles.note}
            </blockquote>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
