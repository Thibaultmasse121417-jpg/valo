import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.brand.name} ${siteConfig.brand.sub}`,
  description: "Privacy policy for the Estalia Studio website.",
};

/** Voir la note dans app/mentions-legales/page.tsx : document légal figé, en anglais. */
export default function ConfidentialitePage() {
  return (
    <main className="bg-ivoire">
      <div className="flex min-h-[40vh] items-end bg-noir px-6 pb-16 pt-32 text-ivoire sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-content">
          <p className="mb-3 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {siteConfig.brand.name} {siteConfig.brand.sub}
          </p>
          <h1 className="font-serif text-4xl uppercase tracking-wide sm:text-5xl">
            Privacy policy
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex max-w-2xl flex-col gap-10 font-sans text-sm leading-relaxed text-noir/70">
          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Data we collect</h2>
            <p>
              The site&apos;s contact form collects the information you voluntarily submit (name,
              company, email, phone, sector, property/establishment URL, message) in order to
              respond to your enquiry.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Cookies</h2>
            <p>
              This site does not use advertising or tracking cookies. Any analytics in use are
              limited to anonymous, aggregate event counts (e.g. page views, button clicks) and do
              not identify you personally. [ Name the analytics tool in use, and add a cookie
              consent banner here if that changes. ]
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">How it&apos;s used</h2>
            <p>
              This information is used solely to respond to your enquiry and, where relevant, to
              discuss a project with you. It is never sold or passed to third parties for
              commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Retention</h2>
            <p>
              Data you submit is kept for as long as needed to handle your enquiry and any
              resulting professional relationship.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl text-noir">Your rights</h2>
            <p>
              Under applicable data protection law (including UK GDPR), you have the right to
              access, correct and request deletion of your data. To exercise it, write to us at{" "}
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
            This document is provided as a starting point and does not constitute legal advice.
            Have your final privacy policy reviewed by a qualified professional before relying on
            it commercially.
          </p>
        </div>
      </div>
    </main>
  );
}
