"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { T, useLang } from "@/lib/LanguageContext";
import { MOBILE_NAV, NAV } from "@/data/site";
import { siteConfig } from "@/data/config";

/**
 * En-tête fixe. « Demander un devis » reste visible sur tous les écrans,
 * téléphone compris, sans jamais recouvrir le contenu de la page.
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hasForm = isHome || pathname.startsWith("/metiers") || pathname === "/sites-web";
  const { toggleLocale, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const quoteHref = hasForm ? "#contact" : "/#contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    // fermé, le menu sort de l'ordre de tabulation et de l'arbre d'accessibilité
    if (open) menuRef.current?.removeAttribute("inert");
    else menuRef.current?.setAttribute("inert", "");
    document.documentElement.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    setTimeout(() => document.querySelector<HTMLElement>(".mmenu nav a")?.focus(), 60);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // le lien de la section à l'écran est marqué « en cours »
  useEffect(() => {
    if (!isHome || !("IntersectionObserver" in window)) {
      setCurrent(null);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setCurrent(en.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id], #contact").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  const solid = scrolled || !isHome || open;

  return (
    <>
      <header className={`site-header${solid ? " is-solid" : ""}`}>
        <div className="wrap bar">
          <Link className="logo" href="/" aria-label={t({ fr: "Estalia Studio — accueil", en: "Estalia Studio — home" })}>
            <span className="logo-word">Estalia</span>
            <span className="logo-sub">{siteConfig.brand.sub}</span>
          </Link>
          <nav className="nav" aria-label={t({ fr: "Navigation principale", en: "Main navigation" })}>
            {NAV.map((n) => (
              <a key={n.id} className="nl" href={href(n.id)} aria-current={current === n.id ? "true" : undefined}>
                {t(n.label)}
              </a>
            ))}
          </nav>
          <div className="head-tools">
            <button
              type="button"
              className="lang-btn desk"
              onClick={toggleLocale}
              aria-label={t({ fr: "Switch to English", en: "Passer en français" })}
            >
              <T fr="EN" en="FR" />
            </button>
            <a className="btn btn--solid quote-btn" href={quoteHref}>
              <T fr="Demander un devis" en="Request a quote" />
            </a>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mmenu"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div ref={menuRef} className="mmenu" id="mmenu" aria-hidden={!open}>
        <div className="wrap">
          <nav aria-label={t({ fr: "Menu mobile", en: "Mobile menu" })}>
            {MOBILE_NAV.map((n, i) => (
              <a key={n.id} href={href(n.id)} onClick={() => setOpen(false)}>
                <span className="label">0{i + 1}</span>
                {t(n.label)}
              </a>
            ))}
          </nav>
          <div className="mm-foot">
            <a className="btn btn--solid" href={quoteHref} onClick={() => setOpen(false)}>
              <T fr="Demander un devis" en="Request a quote" /> <span className="arr" aria-hidden="true">→</span>
            </a>
            <div className="mm-row">
              <span className="small" style={{ userSelect: "all", WebkitUserSelect: "all" }}>
                {siteConfig.contact.email}
              </span>
              <button
                type="button"
                className="lang-btn"
                onClick={toggleLocale}
                aria-label={t({ fr: "Switch to English", en: "Passer en français" })}
              >
                <T fr="English" en="Français" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
