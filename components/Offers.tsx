"use client";

import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

/**
 * Pricing éditorial — trois paliers avec prix réels affichés (Test /
 * Content / Pro). Content porte un badge "most popular" et une bordure
 * légèrement rehaussée : c'est l'offre cœur, elle doit se voir sans
 * ressembler à une pricing card SaaS.
 */
export default function Offers() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="grain relative overflow-hidden bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16">
      <div className="relative z-10 mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{t.offers.kicker}</p>
            </ScrollReveal>
            <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight sm:text-5xl">
              {t.offers.title.map((line, i) => (
                <TitleWipe key={line} delay={0.05 + i * 0.12}>
                  {line}
                </TitleWipe>
              ))}
            </h2>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
            <ScrollReveal>
              <p className="font-sans text-base leading-relaxed text-ivoire/65 sm:text-lg">{t.offers.intro}</p>
            </ScrollReveal>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:mt-24 lg:grid-cols-3 lg:gap-6">
          {t.offers.tiers.map((tier, i) => (
            <ScrollReveal key={tier.title} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col gap-5 border p-8 ${
                  tier.badge ? "border-bronze bg-ivoire/[0.03]" : "border-ivoire/15"
                }`}
              >
                {tier.badge ? (
                  <span className="absolute -top-3 left-8 border border-bronze bg-noir px-3 py-1 font-sans text-[10px] uppercase tracking-widest2 text-bronze">
                    {tier.badge}
                  </span>
                ) : null}
                <h3 className="font-serif text-xl uppercase tracking-tight text-ivoire">{tier.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl text-ivoire">{tier.price}</span>
                  <span className="font-sans text-xs uppercase tracking-widest2 text-ivoire/45">{tier.period}</span>
                </div>
                <p className="font-sans text-sm leading-relaxed text-ivoire/60">{tier.text}</p>
                <ul className="mt-1 flex flex-col gap-2.5 border-t border-ivoire/10 pt-5">
                  {tier.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 font-sans text-[13px] leading-snug text-ivoire/70">
                      <span aria-hidden className="mt-[3px] text-bronze">✦</span>
                      {d}
                    </li>
                  ))}
                </ul>
                {(() => {
                  // Seul Estalia Test passe par un checkout direct (voir
                  // data/config.ts payment.testCheckoutUrl) — Content et
                  // Pro restent volontairement "contact-first". Tant qu'aucun
                  // lien de paiement réel n'est configuré, tout retombe sur
                  // #contact : jamais de bouton mort.
                  const checkoutUrl = tier.id === "test" ? siteConfig.payment.testCheckoutUrl : "";
                  const href = checkoutUrl || "#contact";
                  const external = Boolean(checkoutUrl);
                  return (
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className={`mt-2 inline-flex items-center justify-center gap-2 border px-6 py-3.5 text-center font-sans text-xs uppercase tracking-widest2 transition-colors duration-300 ${
                        tier.badge
                          ? "border-bronze bg-bronze text-noir hover:bg-transparent hover:text-bronze"
                          : "border-ivoire/30 text-ivoire hover:border-bronze hover:text-bronze"
                      }`}
                    >
                      {t.offers.cta}
                    </a>
                  );
                })()}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.15}>
          <p className="mt-10 font-sans text-[11px] uppercase tracking-widest2 text-ivoire/40">{t.offers.note}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-14 border-t border-ivoire/15 pt-10 sm:mt-16">
            <p className="mb-2 font-sans text-xs uppercase tracking-widest2 text-bronze">{t.offers.testNote.kicker}</p>
            <h3 className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">{t.offers.testNote.title}</h3>
            <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-ivoire/60 sm:text-base">
              {t.offers.testNote.text}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
