"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative overflow-hidden bg-noir px-6 pb-10 pt-20 text-ivoire sm:px-10 lg:px-16">
      <div className="relative z-10 mx-auto max-w-content">
        <div className="grid gap-12 border-b border-ivoire/12 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="light" />
            <p className="mt-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
              {siteConfig.brand.signature}
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            {t.footer.nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="w-fit font-sans text-sm text-ivoire/60 transition-colors duration-300 hover:text-bronze"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 font-sans text-sm text-ivoire/60">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="w-fit transition-colors duration-300 hover:text-bronze"
            >
              {siteConfig.contact.email}
            </a>
            <a
              href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
              className="w-fit transition-colors duration-300 hover:text-bronze"
            >
              {siteConfig.contact.phoneDisplay}
            </a>
          </div>

          <div className="flex flex-col gap-3 font-sans text-sm text-ivoire/60">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-fit transition-colors duration-300 hover:text-bronze"
            >
              Instagram
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="w-fit transition-colors duration-300 hover:text-bronze"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 font-sans text-xs text-ivoire/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legal.company}. {t.footer.rights}
          </p>
          <div className="flex gap-6">
            {t.footer.legal.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-300 hover:text-bronze"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
