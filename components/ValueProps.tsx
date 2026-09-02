"use client";

import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";

export default function ValueProps() {
  const { t } = useLanguage();
  const c = t.valueProps;

  return (
    <section className="bg-ivoire px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{c.kicker}</p>
        </ScrollReveal>
        <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight text-noir sm:text-5xl">
          {c.title.map((line, i) => (
            <TitleWipe key={line} delay={0.05 + i * 0.1}>
              {line}
            </TitleWipe>
          ))}
        </h2>

        <ScrollReveal delay={0.1}>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-y border-noir/10 py-7">
            {c.negatives.map((n) => (
              <li key={n} className="flex items-center gap-2.5 font-sans text-sm uppercase tracking-wide text-noir/45 line-through decoration-noir/25">
                {n}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2">
          {c.positives.map((p, i) => (
            <ScrollReveal key={p.title} delay={0.05 + i * 0.06}>
              <div className="flex flex-col gap-2.5">
                <h3 className="font-serif text-xl uppercase tracking-tight text-noir">{p.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-noir/55 sm:text-base">{p.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
