"use client";

import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";

export default function Approach() {
  const { t } = useLanguage();

  return (
    <section id="approche" className="bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {t.approach.kicker}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="max-w-2xl font-serif text-4xl uppercase leading-[1.1] tracking-wide sm:text-5xl lg:text-6xl">
            {t.approach.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </ScrollReveal>

        <div className="mt-20 grid gap-0 border-t border-ivoire/15 sm:mt-24 lg:grid-cols-4">
          {t.approach.steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col gap-6 border-b border-ivoire/15 px-1 py-10 lg:border-b-0 lg:border-r lg:px-8 ${
                  i === t.approach.steps.length - 1 ? "lg:border-r-0" : ""
                } ${i === 0 ? "lg:pl-0" : ""}`}
              >
                <span className="font-serif text-lg text-bronze">{step.number}</span>
                <h3 className="font-serif text-xl uppercase tracking-wide sm:text-2xl">
                  {step.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-ivoire/60">
                  {step.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
