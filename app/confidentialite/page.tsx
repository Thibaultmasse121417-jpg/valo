import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Politique de confidentialité du site Estalia Studio.",
  alternates: { canonical: "/confidentialite" },
};

/** Voir la note de app/mentions-legales/page.tsx : document figé, en français. */
export default function ConfidentialitePage() {
  return (
    <main id="main">
      <section className="s-hero">
        <div className="wrap">
          <p className="label">Estalia Studio</p>
          <h1 className="display" style={{ fontSize: "clamp(3rem, 7vw, 6.4rem)" }}>
            <span className="tl">Confidentialité</span>
          </h1>
        </div>
      </section>
      <section className="section tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="legal">
            <section>
              <h2>Données collectées</h2>
              <p>
                Le formulaire de demande de devis recueille les informations que vous saisissez (nom, adresse e-mail,
                activité, type de projet, message) afin de répondre à votre demande. Elles sont transmises par le service
                Formspree, qui achemine le message jusqu’à nous.
              </p>
            </section>
            <section>
              <h2>Cookies</h2>
              <p>
                Ce site n’utilise pas de cookies publicitaires ni de suivi. Votre choix de langue est enregistré dans
                votre navigateur, sur votre appareil uniquement.{" "}
                <span className="todo">[ Si un outil de mesure d’audience est ajouté, le nommer ici et prévoir le recueil du consentement. ]</span>
              </p>
            </section>
            <section>
              <h2>Utilisation</h2>
              <p>
                Vos informations servent uniquement à vous répondre et, le cas échéant, à échanger sur votre projet. Elles
                ne sont ni vendues ni transmises à des tiers à des fins commerciales.
              </p>
            </section>
            <section>
              <h2>Conservation</h2>
              <p>Vos données sont conservées le temps nécessaire au traitement de votre demande et de la relation qui peut en découler.</p>
            </section>
            <section>
              <h2>Vos droits</h2>
              <p>
                Conformément au RGPD, vous pouvez accéder à vos données, les rectifier ou en demander la suppression en
                écrivant à <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>. Vous pouvez aussi
                adresser une réclamation à la CNIL.
              </p>
            </section>
            <p className="small">
              Ce document est une base de travail et ne constitue pas un conseil juridique. Faites relire votre politique
              de confidentialité par un professionnel avant de vous y fier.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
