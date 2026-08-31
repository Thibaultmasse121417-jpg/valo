"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

export default function About({ hasFounderPhoto }: { hasFounderPhoto: boolean }) {
  const { t } = useLanguage();
  const { founder } = siteConfig;

  return (
    <section id="about" className="bg-ivoire px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
                {t.about.kicker}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="font-serif text-4xl uppercase tracking-wide text-noir sm:text-5xl">
                {t.about.title}
              </h2>
            </ScrollReveal>
            <div className="mt-8 flex flex-col gap-5">
              {t.about.paragraphs.map((p, i) => (
                <ScrollReveal key={p} delay={0.08 + i * 0.06}>
                  <p className="font-sans text-base leading-relaxed text-noir/65 sm:text-lg">
                    {p}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <ScrollReveal delay={0.1}>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir">
                {hasFounderPhoto ? (
                  <Image
                    src={founder.photo}
                    alt={founder.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                    <span className="font-serif text-4xl text-bronze/70" aria-hidden>
                      E
                    </span>
                    <p className="font-serif text-xl uppercase tracking-wide text-ivoire">
                      {founder.name}
                    </p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.16}>
              <div className="mt-6 flex flex-col gap-1">
                <p className="font-serif text-xl text-noir">{founder.name}</p>
                <p className="font-sans text-xs uppercase tracking-widest2 text-bronze">
                  {t.about.founder.title}
                </p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-noir/55">
                  {t.about.founder.text}
                </p>

                <div className="mt-5 flex flex-col gap-2 font-sans text-sm text-noir/70">
                  <a
                    href={`tel:${founder.phone.replace(/\s+/g, "")}`}
                    className="w-fit border-b border-transparent transition-colors duration-300 hover:border-bronze hover:text-bronze"
                  >
                    {founder.phone}
                  </a>
                  <a
                    href={`mailto:${founder.email}`}
                    className="w-fit border-b border-transparent transition-colors duration-300 hover:border-bronze hover:text-bronze"
                  >
                    {founder.email}
                  </a>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit border-b border-transparent transition-colors duration-300 hover:border-bronze hover:text-bronze"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
