"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";

function FaqRow({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <ScrollReveal delay={index * 0.04}>
      <div className="border-b border-noir/10">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="font-serif text-lg text-noir sm:text-xl">{q}</span>
          <span
            aria-hidden
            className={`shrink-0 font-sans text-xl text-bronze transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>
        <div
          className={`grid transition-all duration-300 ease-editorial ${
            open ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <p className="max-w-2xl font-sans text-sm leading-relaxed text-noir/60 sm:text-base">{a}</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function FAQ() {
  const { t } = useLanguage();
  const c = t.faq;

  return (
    <section id="faq" className="bg-ivoire px-6 py-24 sm:px-10 sm:py-28 lg:px-16">
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

        <div className="mt-14 border-t border-noir/10 sm:mt-16">
          {c.items.map((item, i) => (
            <FaqRow key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
