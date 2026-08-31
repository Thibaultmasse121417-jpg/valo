import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: `Mentions légales — ${siteConfig.brand.name} ${siteConfig.brand.sub}`,
  description: "Mentions légales du site Estalia Studio.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="bg-ivoire">
      <div className="flex min-h-[40vh] items-end bg-noir px-6 pb-16 pt-32 text-ivoire sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-content">
          <p className="mb-3 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {siteConfig.brand.name} {siteConfig.brand.sub}
          </p>
          <h1 className="font-serif text-4xl uppercase tracking-wide sm:text-5xl">
            Mentions légales
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex max-w-2xl flex-col gap-10 font-sans text-sm leading-relaxed text-noir/70">
          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Éditeur du site</h2>
            <p>
              {siteConfig.legal.company}
              <br />
              [ Forme juridique — SIREN/SIRET — à compléter ]
              <br />
              [ Adresse du siège social — à compléter ]
              <br />
              Contact :{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="underline decoration-noir/20 underline-offset-2 hover:text-bronze"
              >
                {siteConfig.contact.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Directeur de la publication</h2>
            <p>[ Nom du directeur de la publication — à compléter ]</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Hébergement</h2>
            <p>[ Nom, adresse et contact de l&apos;hébergeur — à compléter, ex. Vercel Inc. ]</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, images, vidéos, identité
              visuelle) est la propriété d&apos;Estalia Studio ou de ses clients, sauf mention
              contraire, et ne peut être reproduit sans autorisation préalable.
            </p>
          </section>

          <p className="text-xs text-noir/40">
            Ce document est fourni à titre indicatif et doit être complété avec vos informations
            légales réelles avant mise en ligne.
          </p>
        </div>
      </div>
    </main>
  );
}
