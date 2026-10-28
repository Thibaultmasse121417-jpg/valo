import type { Metadata } from "next";
import { siteConfig } from "@/data/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et conditions du site Estalia Studio.",
  alternates: { canonical: "/mentions-legales" },
};

/**
 * Document légal figé, en français. Tout ce qui est entre [ ] est un vrai
 * vide à compléter par le fondateur — jamais une donnée inventée
 * (SIREN, adresse, hébergeur…). À faire relire par un professionnel.
 */
export default function MentionsLegalesPage() {
  const todo = (text: string) => <span className="todo">[ {text} ]</span>;
  return (
    <main id="main">
      <section className="s-hero">
        <div className="wrap">
          <p className="label">Estalia Studio</p>
          <h1 className="display" style={{ fontSize: "clamp(3rem, 7vw, 6.4rem)" }}>
            <span className="tl">Mentions</span>
            <span className="tl in1"><em>légales</em></span>
          </h1>
        </div>
      </section>
      <section className="section tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="legal">
            <section>
              <h2>Éditeur du site</h2>
              <p>
                {siteConfig.legal.company} — {siteConfig.founder.name}
                <br />
                {todo("Forme juridique et numéro SIREN — à compléter")}
                <br />
                {todo("Adresse du siège — à compléter")}
                <br />
                Contact&nbsp;: <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
              </p>
            </section>
            <section>
              <h2>Directeur de la publication</h2>
              <p>{todo("Nom du directeur de la publication — à compléter")}</p>
            </section>
            <section>
              <h2>Hébergement</h2>
              <p>{todo("Nom, adresse et contact de l’hébergeur — à compléter (par exemple Vercel Inc.)")}</p>
            </section>
            <section>
              <h2>Propriété intellectuelle</h2>
              <p>
                Les contenus de ce site (textes, images, vidéos, identité visuelle) appartiennent à Estalia Studio ou à ses
                clients, sauf mention contraire, et ne peuvent être reproduits sans autorisation préalable.
              </p>
            </section>
            <section>
              <h2>Conditions des prestations</h2>
              <h3>Prestations</h3>
              <p>
                Estalia Studio crée des films de promotion, des contenus visuels, des sites web et des directions artistiques.
                Les films peuvent être réalisés à partir des photos et vidéos fournies par le client, à distance.
              </p>
              <h3 style={{ marginTop: 18 }}>Devis</h3>
              <p>
                Chaque prestation fait l’objet d’un devis précisant son contenu, son prix, ses délais et les ajustements
                inclus. {todo("Conditions de paiement, d’annulation et de facturation — à compléter")}
              </p>
              <h3 style={{ marginTop: 18 }}>Visuels fournis</h3>
              <p>
                Le client garantit détenir les droits sur les photos et vidéos qu’il transmet et autorise Estalia Studio à
                les utiliser pour réaliser ses contenus.
              </p>
              <h3 style={{ marginTop: 18 }}>Responsabilité et droit applicable</h3>
              <p>{todo("Clause de responsabilité, droit applicable et juridiction — à rédiger avec un professionnel")}</p>
            </section>
            <p className="small">
              Ce document est une base de travail et ne constitue pas un conseil juridique. Faites-le relire par un
              professionnel et complétez chaque champ entre crochets avant de vous y fier.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
