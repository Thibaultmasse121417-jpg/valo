"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import Logo from "./Logo";

export default function Header() {
  const { t, locale, toggleLocale } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const darkText = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || menuOpen
          ? "bg-ivoire/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <a href="#top" aria-label={locale === "fr" ? "Estalia Studio — Accueil" : "Estalia Studio — Home"}>
          <Logo tone={darkText ? "dark" : "light"} />
        </a>

        <nav
          className={`hidden items-center gap-9 font-sans text-[11px] uppercase tracking-widest2 transition-colors duration-500 lg:flex ${
            darkText ? "text-noir/70" : "text-ivoire/85"
          }`}
        >
          {t.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative pb-1 transition-colors duration-300 hover:text-bronze"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={toggleLocale}
            aria-label="Changer de langue"
            className={`border px-2 py-1 text-[10px] transition-colors duration-300 hover:border-bronze hover:text-bronze ${
              darkText ? "border-noir/20" : "border-ivoire/30"
            }`}
          >
            {locale === "fr" ? "FR / EN" : "EN / FR"}
          </button>
          <a
            href="#contact"
            className={`border px-4 py-2.5 transition-colors duration-300 hover:border-bronze hover:text-bronze ${
              darkText ? "border-noir/30" : "border-ivoire/40"
            }`}
          >
            {t.nav.cta}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={menuOpen}
          className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-px w-5 transition-all duration-300 ${
              darkText ? "bg-noir" : "bg-ivoire"
            } ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 transition-all duration-300 ${
              darkText ? "bg-noir" : "bg-ivoire"
            } ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-x-0 top-[72px] z-40 flex h-[calc(100dvh-72px)] flex-col justify-between overflow-y-auto bg-ivoire px-6 pb-10 pt-6 sm:px-10 lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {t.nav.links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.5 }}
                  className="border-b border-noir/10 py-5 font-serif text-2xl uppercase tracking-tight text-noir"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <div className="flex flex-col gap-5">
              <button
                type="button"
                onClick={toggleLocale}
                className="w-fit border border-noir/20 px-3 py-2 font-sans text-xs uppercase tracking-widest2 text-noir/70"
              >
                {locale === "fr" ? "FR / EN" : "EN / FR"}
              </button>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="w-full border border-noir px-6 py-4 text-center font-sans text-xs uppercase tracking-widest2 text-noir"
              >
                {t.nav.cta}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
