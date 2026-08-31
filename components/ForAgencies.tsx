"use client";

import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";

export default function ForAgencies() {
  const { t } = useLanguage();

  return (
    <section id="agences" className="bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
                {t.agencies.kicker}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-wide sm:text-5xl">
                {t.agencies.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </ScrollReveal>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
            {t.agencies.paragraphs.map((p, i) => (
              <ScrollReveal key={p} delay={0.05 + i * 0.06}>
                <p className="font-sans text-base leading-relaxed text-ivoire/65 sm:text-lg">
                  {p}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-0 border-t border-ivoire/15 sm:mt-24 lg:grid-cols-3">
          {t.agencies.tiers.map((tier, i) => (
            <ScrollReveal key={tier.title} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col gap-3 border-b border-ivoire/15 py-9 pr-8 lg:border-b-0 lg:border-r lg:py-12 ${
                  i === t.agencies.tiers.length - 1 ? "lg:border-r-0" : ""
                }`}
              >
                <h3 className="font-serif text-xl uppercase tracking-wide text-bronze">
                  {tier.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-ivoire/60">
                  {tier.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <a
            href="#contact-agence"
            className="mt-16 inline-block border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir sm:mt-20"
          >
            {t.agencies.cta}
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
