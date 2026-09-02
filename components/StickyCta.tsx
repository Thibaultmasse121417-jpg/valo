"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

const STORAGE_KEY = "estalia-sticky-cta-dismissed";

/**
 * Rappel de conversion discret : apparaît une fois le Hero dépassé,
 * disparaît à nouveau une fois la section Contact atteinte (pour ne
 * jamais se superposer au funnel), et reste masqué pour le reste de la
 * session si l'utilisateur le ferme. Aucune animation tape-à-l'œil,
 * aucun blocage de l'écran — un simple lien, toujours dans le style
 * fin/bordé du reste du site.
 */
export default function StickyCta() {
  const { t } = useLanguage();
  const [pastHero, setPastHero] = useState(false);
  const [nearContact, setNearContact] = useState(false);
  const [nearPricing, setNearPricing] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    const contact = document.getElementById("contact");
    // La section pricing porte ses propres CTA ("Start with Estalia") —
    // le rappel flottant ne doit pas se superposer à ces boutons, en
    // particulier sur mobile où il chevauche le bas des cartes.
    const pricing = document.getElementById("pricing");
    if (!hero || !contact) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );
    const contactObserver = new IntersectionObserver(
      ([entry]) => setNearContact(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -40% 0px" }
    );
    heroObserver.observe(hero);
    contactObserver.observe(contact);

    let pricingObserver: IntersectionObserver | undefined;
    if (pricing) {
      pricingObserver = new IntersectionObserver(
        ([entry]) => setNearPricing(entry.isIntersecting),
        { threshold: 0 }
      );
      pricingObserver.observe(pricing);
    }

    return () => {
      heroObserver.disconnect();
      contactObserver.disconnect();
      pricingObserver?.disconnect();
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const visible = pastHero && !nearContact && !nearPricing && !dismissed;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 border border-noir/15 bg-ivoire/95 py-3 pl-5 pr-2 shadow-[0_4px_24px_rgba(10,10,9,0.08)] backdrop-blur sm:bottom-8 sm:right-8"
        >
          <a
            href="#contact"
            className="font-sans text-[11px] uppercase tracking-widest2 text-noir/80 transition-colors duration-300 hover:text-bronze"
          >
            {t.stickyCta.label} →
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.stickyCta.dismiss}
            className="flex h-7 w-7 items-center justify-center text-noir/40 transition-colors duration-300 hover:text-noir"
          >
            <span aria-hidden className="text-sm leading-none">
              &times;
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
