import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: `Legal Notice — ${siteConfig.brand.name} ${siteConfig.brand.sub}`,
  description: "Legal notice and terms of service for the Estalia Studio website.",
};

/**
 * Page en anglais (langue par défaut du lancement UK — brief Phase 2 §36).
 * Contrairement au reste du site, cette page n'est pas pilotée par
 * data/content.ts : c'est un document légal figé, pas une copie
 * marketing à faire varier — un futur passage au bilingue FR/EN se
 * ferait par un second fichier plutôt que par le LanguageContext.
 * Toute information encadrée par [ ] est un vrai vide à compléter —
 * jamais une donnée inventée (SIREN, adresse, hébergeur…).
 */
export default function MentionsLegalesPage() {
  return (
    <main className="bg-ivoire">
      <div className="flex min-h-[40vh] items-end bg-noir px-6 pb-16 pt-32 text-ivoire sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-content">
          <p className="mb-3 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {siteConfig.brand.name} {siteConfig.brand.sub}
          </p>
          <h1 className="font-serif text-4xl uppercase tracking-wide sm:text-5xl">
            Legal notice &amp; terms
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex max-w-2xl flex-col gap-10 font-sans text-sm leading-relaxed text-noir/70">
          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Publisher</h2>
            <p>
              {siteConfig.legal.company}
              <br />
              [ Legal structure — company number — to complete ]
              <br />
              [ Registered address — to complete ]
              <br />
              Contact:{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="underline decoration-noir/20 underline-offset-2 hover:text-bronze"
              >
                {siteConfig.contact.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Publication director</h2>
            <p>[ Name of the publication director — to complete ]</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Hosting</h2>
            <p>[ Host name, address and contact — to complete, e.g. Vercel Inc. ]</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Intellectual property</h2>
            <p>
              All content on this site (text, images, video, visual identity) is the property of
              Estalia Studio or its clients, unless stated otherwise, and may not be reproduced
              without prior authorisation.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl text-noir">Terms of service</h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">1. Service</h3>
                <p>
                  Estalia is a remote creative content studio. We turn photography and video a
                  client already owns into edited, social-native content. We do not attend a
                  client&apos;s property and do not organise a physical photo or video shoot as
                  part of any offer described on this site.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">2. Offers &amp; payment</h3>
                <p>
                  Estalia Test is a one-time, single-payment order. Estalia Content and Estalia
                  Pro are recurring monthly subscriptions with a minimum initial commitment as
                  stated on the pricing section; they renew monthly until cancelled and may be
                  cancelled with notice as agreed at onboarding. [ Cancellation notice period,
                  invoicing details and payment provider terms — to complete ].
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">3. Source material &amp; rights</h3>
                <p>
                  The client warrants that they own, or hold the necessary rights to, any
                  photography or video they send us, and grants Estalia a licence to use it solely
                  to produce their content. Estalia does not alter the real layout, furniture or
                  structure of a client&apos;s property in the content it produces.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">4. Revisions &amp; delivery</h3>
                <p>
                  Each offer includes a defined number of revision rounds, as stated on the
                  pricing section. Nothing is published or delivered as final without the
                  client&apos;s review.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">5. Liability</h3>
                <p>
                  [ Liability limitation clause — to be drafted with a qualified professional
                  before this document is relied on commercially. ]
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-serif text-lg text-noir">6. Governing law</h3>
                <p>[ Governing law and jurisdiction — to complete ]</p>
              </div>
            </div>
          </section>

          <p className="text-xs text-noir/40">
            This document is provided as a starting point and does not constitute legal advice.
            Have it reviewed by a qualified professional, and complete every [ bracketed ] field
            with your real details, before relying on it commercially.
          </p>
        </div>
      </div>
    </main>
  );
}
