"use client";

import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";

export default function Trust() {
  const { t } = useLanguage();

  return (
    <section className="bg-ivoire px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-12 border-t border-noir/15 pt-14 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-cols-4">
          {t.trust.items.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.06}>
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-lg uppercase tracking-wide text-noir">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-noir/55">
                  {item.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <a
            href="#contact"
            className="mt-14 inline-block w-fit border-b border-noir/30 pb-1 font-sans text-xs uppercase tracking-widest2 text-noir/70 transition-colors duration-300 hover:border-bronze hover:text-bronze sm:mt-16"
          >
            {t.trust.cta} →
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
