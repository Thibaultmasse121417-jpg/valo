"use client";

import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";

export default function Manifesto() {
  const { t } = useLanguage();

  return (
    <section className="bg-ivoire px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto grid max-w-content gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <ScrollReveal>
            <p className="mb-5 font-sans text-xs uppercase tracking-widest2 text-bronze">
              {t.manifesto.kicker}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-wide text-noir sm:text-5xl lg:text-[3.4rem]">
              {t.manifesto.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </ScrollReveal>
        </div>

        <div className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7">
          {t.manifesto.paragraphs.map((paragraph, i) => (
            <ScrollReveal key={paragraph} delay={i * 0.07}>
              <p
                className={`font-sans leading-relaxed text-noir/70 ${
                  i === 0 || i === 1
                    ? "text-lg sm:text-xl"
                    : "text-base sm:text-lg"
                }`}
              >
                {paragraph}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
