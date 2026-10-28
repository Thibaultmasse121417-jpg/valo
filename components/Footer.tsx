"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T, useLang } from "@/lib/LanguageContext";
import { TRADES, TRADE_ORDER, tradeHref } from "@/data/site";
import { siteConfig } from "@/data/config";

export default function Footer() {
  const pathname = usePathname();
  const { toggleLocale, t } = useLang();
  const home = (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-cols">
          <div>
            <h2 className="label">Navigation</h2>
            <ul>
              <li><a href={home("films")}><T fr="Le film" en="The film" /></a></li>
              <li><a href={home("promo")}><T fr="Vidéos promo" en="Promo videos" /></a></li>
              <li><a href={home("saisons")}><T fr="Saisons" en="Seasons" /></a></li>
              <li><a href={home("tarifs")}><T fr="Tarifs" en="Pricing" /></a></li>
              <li><a href={home("faq")}>FAQ</a></li>
            </ul>
          </div>
          <div>
            <h2 className="label"><T fr="Métiers" en="Trades" /></h2>
            <ul>
              {[...TRADE_ORDER, "sites-web" as const].map((slug) => (
                <li key={slug}>
                  <Link href={tradeHref(slug)}>{t(TRADES[slug].name)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="label"><T fr="Écrire" en="Write" /></h2>
            <ul>
              <li><span className="muted" style={{ userSelect: "all", WebkitUserSelect: "all" }}>{siteConfig.contact.email}</span></li>
              <li><a href={home("contact")}><T fr="Demander un devis" en="Request a quote" /></a></li>
            </ul>
          </div>
          <div>
            <h2 className="label"><T fr="Langue" en="Language" /></h2>
            <ul>
              <li>
                <button type="button" className="tlink" onClick={toggleLocale} aria-label={t({ fr: "Switch to English", en: "Passer en français" })}>
                  <T fr="English" en="Français" />
                </button>
              </li>
            </ul>
          </div>
        </div>
        <p className="wordmark" aria-hidden="true">Estal<em>ia</em></p>
        <div className="foot-base">
          <p className="small">© {new Date().getFullYear()} Estalia Studio — {siteConfig.founder.name}</p>
          <nav className="small" aria-label={t({ fr: "Informations légales", en: "Legal" })}>
            <Link href="/mentions-legales"><T fr="Mentions légales" en="Legal notice" /></Link>
            <Link href="/confidentialite"><T fr="Confidentialité" en="Privacy" /></Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
