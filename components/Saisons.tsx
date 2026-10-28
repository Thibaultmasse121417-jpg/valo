"use client";

import { useEffect, useRef, useState } from "react";
import { T, useLang } from "@/lib/LanguageContext";
import { MONTHS, SEASONS } from "@/data/site";
import SectionHead from "@/components/SectionHead";
import QuoteLink from "@/components/QuoteLink";

/**
 * Calendrier de l'année et les temps forts. Survoler une carte (souris)
 * ou la faire défiler à l'écran (téléphone) allume son mois.
 */
export default function Saisons() {
  const { t } = useLang();
  const [on, setOn] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const io = new IntersectionObserver(
      (entries) => {
        if (fine.matches || list.scrollWidth <= list.clientWidth) return;
        entries.forEach((en) => {
          if (en.intersectionRatio > 0.6) setOn((en.target as HTMLElement).dataset.season ?? null);
        });
      },
      { root: list, threshold: [0, 0.6, 1] }
    );
    list.querySelectorAll("[data-season]").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section" id="saisons" aria-labelledby="saisons-title">
      <div className="wrap">
        <SectionHead
          num="04"
          id="saisons-title"
          label={{ fr: "Packs saisonniers", en: "Seasonal packs" }}
          title={{
            fr: [{ t: "Un film pour chaque" }, { t: "*temps fort de l’année.*", c: "r" }],
            en: [{ t: "A film for every" }, { t: "*highlight of the year.*", c: "r" }],
          }}
          body={{
            fr: "Choisissez les moments qui comptent pour votre activité. Nous préparons chaque film en amont, pour le publier au bon moment.",
            en: "Choose the moments that matter for your business. We prepare each film ahead, so it goes out at the right time.",
          }}
        />
        <div className="cal" data-reveal aria-hidden="true">
          <div className="cal-months">
            {MONTHS.map((m, i) => (
              <span key={i}>
                <span className="cal-m-long">{t(m.long)}</span>
                <span className="cal-m-short">{m.short}</span>
              </span>
            ))}
          </div>
          <div className="cal-marks">
            {SEASONS.map((s) => (
              <span
                key={s.id}
                className={`mark${s.from === s.to ? " dot" : ""}${on === s.id ? " is-on" : ""}`}
                style={{ gridColumn: `${s.from} / span ${s.to - s.from + 1}` }}
              />
            ))}
          </div>
        </div>
        <ol ref={listRef} className="seasons hscroll">
          {SEASONS.map((s, i) => (
            <li key={s.id} data-reveal style={{ ["--d" as string]: `${((i % 4) * 0.05).toFixed(2)}s` }}>
              <article
                className="season"
                data-season={s.id}
                onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOn(s.id)}
                onMouseLeave={() => window.matchMedia("(hover: hover)").matches && setOn(null)}
              >
                <p className="when">{t(s.when)}</p>
                <h3>{t(s.title)}</h3>
                <p>{t(s.text)}</p>
                <p className="film"><T fr="Réseaux · site · Google" en="Social · website · Google" /></p>
              </article>
            </li>
          ))}
        </ol>
        <div className="season-note" data-reveal>
          <QuoteLink className="tlink" type="saisons">
            <T fr="Composer mon pack saisonnier" en="Build my seasonal pack" /> <span className="arr" aria-hidden="true">→</span>
          </QuoteLink>
        </div>
      </div>
    </section>
  );
}
