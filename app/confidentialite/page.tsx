import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${siteConfig.brand.name} ${siteConfig.brand.sub}`,
  description: "Politique de confidentialité du site Estalia Studio.",
};

export default function ConfidentialitePage() {
  return (
    <main className="bg-ivoire">
      <div className="flex min-h-[40vh] items-end bg-noir px-6 pb-16 pt-32 text-ivoire sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-content">
          <p className="mb-3 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {siteConfig.brand.name} {siteConfig.brand.sub}
          </p>
          <h1 className="font-serif text-4xl uppercase tracking-wide sm:text-5xl">
            Politique de confidentialité
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex max-w-2xl flex-col gap-10 font-sans text-sm leading-relaxed text-noir/70">
          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Données collectées</h2>
            <p>
              Le formulaire de contact du site collecte les informations que vous transmettez
              volontairement (nom, entreprise, email, téléphone, secteur, lien du bien ou de
              l&apos;établissement, message) afin de traiter votre demande.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Utilisation</h2>
            <p>
              Ces informations sont utilisées uniquement pour répondre à votre demande et, le cas
              échéant, échanger sur un projet de réalisation. Elles ne sont ni vendues, ni cédées à
              des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Conservation</h2>
            <p>
              Les données transmises sont conservées le temps nécessaire au traitement de votre
              demande et à la relation professionnelle qui pourrait en découler.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Vos droits</h2>
            <p>
              Conformément à la réglementation applicable, vous disposez d&apos;un droit d&apos;accès,
              de rectification et de suppression de vos données. Pour l&apos;exercer, écrivez-nous à{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="underline decoration-noir/20 underline-offset-2 hover:text-bronze"
              >
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </section>

          <p className="text-xs text-noir/40">
            Ce document est fourni à titre indicatif et ne constitue pas un avis juridique. Faites
            valider votre politique de confidentialité définitive par un professionnel du droit
            avant mise en ligne.
          </p>
        </div>
      </div>
    </main>
  );
}
