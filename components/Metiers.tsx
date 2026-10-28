"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { T, useLang } from "@/lib/LanguageContext";
import { lines } from "@/lib/rich";
import { TRADES, TRADE_ORDER, tradeHref } from "@/data/site";
import SectionHead from "@/components/SectionHead";
import Example from "@/components/Example";
import QuoteLink from "@/components/QuoteLink";

/** Un onglet par métier : ce qu'on lui apporte, un exemple de film, sa page dédiée. */
export default function Metiers() {
  const { t, locale } = useLang();
  const [active, setActive] = useState(0);
  const [entering, setEntering] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const select = (i: number, focus = false) => {
    setActive(i);
    setEntering(false);
    requestAnimationFrame(() => setEntering(true));
    const tab = tabsRef.current?.children[i] as HTMLElement | undefined;
    if (!tab) return;
    if (focus) tab.focus();
    const strip = tabsRef.current!;
    const r = tab.getBoundingClientRect();
    const sr = strip.getBoundingClientRect();
    if (r.left < sr.left || r.right > sr.right) strip.scrollBy({ left: r.left - sr.left - 12, behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    const n = TRADE_ORDER.length;
    const next =
      e.key === "ArrowRight" ? active + 1 : e.key === "ArrowLeft" ? active - 1 : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    select((next + n) % n, true);
  };

  return (
    <section className="section" id="metiers" aria-labelledby="metiers-title">
      <div className="wrap">
        <SectionHead
          num="03"
          id="metiers-title"
          label={{ fr: "Métiers", en: "Trades" }}
          title={{ fr: [{ t: "Quatre métiers," }, { t: "*une même exigence.*", c: "in1" }], en: [{ t: "Four trades," }, { t: "*one standard.*", c: "in1" }] }}
        />
        <div ref={tabsRef} className="tabs" role="tablist" aria-label={t({ fr: "Métiers", en: "Trades" })} onKeyDown={onKey}>
          {TRADE_ORDER.map((slug, i) => (
            <button
              key={slug}
              type="button"
              role="tab"
              className="tab"
              id={`tab-${slug}`}
              aria-controls={`panel-${slug}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
            >
              <span className="n">0{i + 1}</span>
              {t(TRADES[slug].name)}
            </button>
          ))}
        </div>
        {TRADE_ORDER.map((slug, i) => {
          const tr = TRADES[slug];
          return (
            <div
              key={slug}
              className={`panel${entering && i === active ? " is-entering" : ""}`}
              role="tabpanel"
              id={`panel-${slug}`}
              aria-labelledby={`tab-${slug}`}
              tabIndex={0}
              hidden={i !== active}
            >
              <div className="p-txt">
                <p className="label">{t(tr.who)}</p>
                <h3 className="t-m">{lines(tr.title[locale].map((l) => ({ t: l.t })))}</h3>
                <p className="body-l">{t(tr.intro)}</p>
                <ol className="gains">
                  {tr.gains.map((g, j) => (
                    <li key={j}>
                      <span className="n">0{j + 1}</span>
                      <span>{t(g)}</span>
                    </li>
                  ))}
                </ol>
                <div className="acts">
                  <QuoteLink context={tr.ctx}>
                    <T fr="Demander un devis" en="Request a quote" /> <span className="arr" aria-hidden="true">→</span>
                  </QuoteLink>
                  <Link className="tlink" href={tradeHref(slug)}>
                    <T fr="Tout sur ce métier" en="More on this trade" /> <span className="arr" aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <Example trade={tr} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
