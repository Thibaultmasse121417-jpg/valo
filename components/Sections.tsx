import Link from "next/link";
import { T } from "@/lib/LanguageContext";
import { FAQS, PLANS, SITE_ROWS, STEPS } from "@/data/site";
import { siteConfig } from "@/data/config";
import SectionHead from "@/components/SectionHead";
import QuoteLink from "@/components/QuoteLink";

const N = " ";
const Arrow = () => <span className="arr" aria-hidden="true">→</span>;

export function Sites() {
  return (
    <section className="section" id="sites" aria-labelledby="sites-title">
      <div className="wrap">
        <SectionHead
          num="05"
          id="sites-title"
          label={{ fr: "Sites web", en: "Websites" }}
          title={{
            fr: [{ t: "Des sites sur mesure," }, { t: "*taillés pour votre métier.*" }],
            en: [{ t: "Bespoke websites," }, { t: "*cut for your trade.*" }],
          }}
          body={{
            fr: "Un site dessiné pour votre activité, cohérent avec vos films, clair sur téléphone et pensé pour qu’on vous contacte.",
            en: "A website designed for your business, consistent with your films, clear on a phone and built to get you contacted.",
          }}
        />
        <div className="sites-rows">
          {SITE_ROWS.map((r, i) => (
            <div key={r.name.fr} className="site-row" data-reveal>
              <span className="label"><b>0{i + 1}</b></span>
              <h3><T fr={r.name.fr} en={r.name.en} /></h3>
              <p><T fr={r.text.fr} en={r.text.en} /></p>
            </div>
          ))}
        </div>
        <div className="sites-foot" data-reveal>
          <QuoteLink className="btn" type="site">
            <T fr="Demander un devis pour un site" en="Request a website quote" /> <Arrow />
          </QuoteLink>
          <Link className="tlink" href="/sites-web">
            <T fr="Notre approche du web" en="Our approach to the web" /> <Arrow />
          </Link>
          <span className="small">
            <T fr="Ce site a été conçu et développé par Estalia Studio." en="This website was designed and built by Estalia Studio." />
          </span>
        </div>
      </div>
    </section>
  );
}

export function Methode() {
  return (
    <section className="section" id="methode" aria-labelledby="methode-title">
      <div className="wrap">
        <SectionHead
          num="06"
          id="methode-title"
          size="t-m"
          label={{ fr: "Méthode", en: "Process" }}
          title={{ fr: [{ t: "Une collaboration *simple et directe.*" }], en: [{ t: "A simple, *direct collaboration.*" }] }}
        />
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title.fr} className="step" data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
              <span className="n">0{i + 1}</span>
              <h3><T fr={s.title.fr} en={s.title.en} /></h3>
              <p><T fr={s.text.fr} en={s.text.en} /></p>
            </li>
          ))}
        </ol>
        <div className="note" data-reveal>
          <p>
            <T
              fr={`Pour un film créé à partir de vos visuels, vous nous transmettez simplement vos photos et vidéos à distance${N}: aucun tournage sur place n’est nécessaire.`}
              en="For a film made from your visuals, you simply send us your photos and videos remotely: no on-site shoot is needed."
            />
          </p>
        </div>
      </div>
    </section>
  );
}

export function Tarifs() {
  return (
    <section className="section" id="tarifs" aria-labelledby="tarifs-title">
      <div className="wrap">
        <SectionHead
          num="07"
          id="tarifs-title"
          label={{ fr: "Tarifs", en: "Pricing" }}
          title={{
            fr: [{ t: "Trois formules," }, { t: "*un devis sur mesure.*", c: "in2" }],
            en: [{ t: "Three packages," }, { t: "*a tailored quote.*", c: "in2" }],
          }}
          body={{
            fr: `Chaque projet est différent${N}: nous établissons un devis précis à partir de votre besoin.`,
            en: "Every project is different: we prepare a precise quote based on your needs.",
          }}
        />
        <div className="plans">
          {PLANS.map((p, i) => (
            <article key={p.id} className={`plan${p.featured ? " is-feat" : ""}`} data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
              <div className="top">
                <span className="label"><b>0{i + 1}</b></span>
                {p.featured && <span className="badge"><T fr="Pensé pour les commerces" en="Made for shops" /></span>}
              </div>
              <h3><T fr={p.name.fr} en={p.name.en} /></h3>
              <p className="for"><T fr={p.forWho.fr} en={p.forWho.en} /></p>
              <ul>
                {p.items.map((it) => (
                  <li key={it.fr}><T fr={it.fr} en={it.en} /></li>
                ))}
              </ul>
              <div className="price">
                <span className="label"><T fr="Tarif" en="Price" /></span>
                <strong><T fr="Sur devis" en="On quote" /></strong>
              </div>
              <QuoteLink className={`btn${p.featured ? " btn--solid" : ""}`} type={p.id}>
                <T fr="Demander un devis" en="Request a quote" /> <Arrow />
              </QuoteLink>
            </article>
          ))}
        </div>
        <p className="small plans-note" data-reveal>
          <T fr="Le contenu exact de chaque formule est précisé dans votre devis." en="The exact content of each package is set out in your quote." />
        </p>
      </div>
    </section>
  );
}

export function Studio() {
  return (
    <section className="section" id="studio" aria-labelledby="studio-title">
      <div className="wrap studio-grid">
        <div className="studio-id">
          <p className="label" data-reveal><b>08</b>&nbsp; Studio</p>
          <h2 className="studio-name" id="studio-title" data-reveal>
            Thibault<br /><em>Masse</em>
          </h2>
          <p className="label studio-role" data-reveal>
            <T fr="Fondateur — directeur artistique, designer web & vidéaste" en="Founder — art director, web designer & filmmaker" />
          </p>
        </div>
        <div className="studio-txt">
          <p className="first" data-reveal>
            <T
              fr={`«${N}Avant de monter une séquence ou de dessiner une page, je cherche ce qui rend un endroit unique${N}: une lumière, une matière, un rythme.${N}»`}
              en="“Before cutting a sequence or designing a page, I look for what makes a place unique: a light, a material, a rhythm.”"
            />
          </p>
          <p data-reveal>
            <T
              fr="Je suis directeur artistique, designer web et vidéaste. J’ai créé Estalia Studio pour accompagner les lieux et les métiers qui méritent mieux que des images interchangeables."
              en="I’m an art director, web designer and filmmaker. I founded Estalia Studio to work with places and trades that deserve better than interchangeable images."
            />
          </p>
          <p data-reveal>
            <T fr="Vous échangez directement avec moi, du premier message à la livraison." en="You work with me directly, from the first message to delivery." />
          </p>
          <p data-reveal className="small" style={{ marginTop: 22 }}>{siteConfig.founder.name} — {siteConfig.contact.email}</p>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div className="faq-head">
          <p className="label" data-reveal><b>09</b>&nbsp; FAQ</p>
          <h2 className="t-m" id="faq-title" data-reveal>
            <T fr={<>Questions <em>fréquentes</em></>} en={<>Frequently <em>asked</em></>} />
          </h2>
        </div>
        <div className="faq-list" data-reveal>
          {FAQS.map((f) => (
            <details key={f.q.fr}>
              <summary>
                <T fr={f.q.fr} en={f.q.en} />
                <span className="pm" aria-hidden="true" />
              </summary>
              <div className="a"><p><T fr={f.a.fr} en={f.a.en} /></p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
