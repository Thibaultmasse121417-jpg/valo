import Image from "next/image";
import Link from "next/link";
import { T } from "@/lib/LanguageContext";
import { lines } from "@/lib/rich";
import { TRADES, TRADE_ORDER, tradeHref, type PageSlug } from "@/data/site";
import Example from "@/components/Example";
import FilmButton from "@/components/FilmButton";
import QuoteLink from "@/components/QuoteLink";
import ContactForm from "@/components/ContactForm";

const N = " ";

/** Page dédiée à un métier (et page « Sites web ») : même gabarit, contenu de data/site.ts. */
export default function TradePage({ slug }: { slug: PageSlug }) {
  const tr = TRADES[slug];
  const others = ([...TRADE_ORDER, "sites-web"] as PageSlug[]).filter((s) => s !== slug);

  return (
    <main id="main">
      <section className="s-hero" aria-labelledby="s-title">
        <div className="wrap">
          <p className="crumbs label">
            <Link href="/#metiers"><T fr="Métiers" en="Trades" /></Link>
            <span aria-hidden="true">/</span>
            <span><T fr={tr.long.fr} en={tr.long.en} /></span>
          </p>
          <h1 className="display" id="s-title">
            <T fr={lines(tr.title.fr)} en={lines(tr.title.en)} />
          </h1>
          <p className="body-l"><T fr={tr.intro.fr} en={tr.intro.en} /></p>
          <div className="ctas">
            <QuoteLink context={tr.ctx} type={slug === "sites-web" ? "site" : undefined}>
              <T fr="Demander un devis" en="Request a quote" /> <span className="arr" aria-hidden="true">→</span>
            </QuoteLink>
            <FilmButton><T fr="Voir le film" en="Watch the film" /></FilmButton>
          </div>
        </div>
      </section>

      {tr.img && (
        <div className="wrap">
          <figure className="frame s-visual" data-reveal>
            <Image src={tr.img.src} alt={tr.img.alt.fr} fill priority sizes="(min-width: 1440px) 1312px, 100vw" data-parallax />
            <span className="badge on-img"><T fr="Étude de direction artistique" en="Art direction study" /></span>
          </figure>
        </div>
      )}

      <section className="section" aria-labelledby="s-what">
        <div className="wrap">
          <div className="sec-head">
            <p className="label"><b>—</b>&nbsp; <T fr="Ce que nous vous apportons" en="What we bring you" /></p>
            <h2 className="t-l" id="s-what"><T fr={<>Pour vous, <em>concrètement.</em></>} en={<>For you, <em>in practice.</em></>} /></h2>
          </div>
          <ol className="steps three">
            {tr.gains.map((g, i) => (
              <li key={g.fr} className="step" data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
                <span className="n">0{i + 1}</span>
                <p className="strong"><T fr={g.fr} en={g.en} /></p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="s-example">
        <div className="wrap">
          {slug === "sites-web" ? (
            <div className="panel">
              <div className="p-txt">
                <p className="label"><T fr="Un exemple" en="An example" /></p>
                <h2 className="t-m" id="s-example"><T fr="Ce site" en="This website" /></h2>
                <p className="body-l">
                  <T
                    fr={`Direction artistique, design et développement${N}: ce site a été conçu par Estalia Studio. Il montre notre manière de composer une page, de l’image au formulaire de devis.`}
                    en="Art direction, design and build: this website was made by Estalia Studio. It shows how we compose a page, from the image to the quote form."
                  />
                </p>
                <div className="acts">
                  <Link className="tlink" href="/"><T fr="Revoir l’accueil" en="Back to the home page" /> <span className="arr" aria-hidden="true">→</span></Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel">
              <div className="p-txt">
                <p className="label"><T fr="Notre travail" en="Our work" /></p>
                <h2 className="t-m" id="s-example">
                  <T
                    fr={<><span className="tl">La même exigence,</span><span className="tl"><em>pour votre lieu.</em></span></>}
                    en={<><span className="tl">The same standard,</span><span className="tl"><em>for your place.</em></span></>}
                  />
                </h2>
                <p className="body-l">
                  <T fr={`Chaque film est construit avec le même soin${N}: cadrage, rythme, couleur et son.`} en="Every film is built with the same care: framing, pacing, colour and sound." />
                </p>
              </div>
              <Example trade={tr} />
            </div>
          )}
        </div>
      </section>

      <section className="section tight" aria-labelledby="s-others">
        <div className="wrap">
          <h2 className="label" id="s-others" style={{ marginBottom: 20 }}><T fr="Autres métiers" en="Other trades" /></h2>
          <div className="others">
            {others.map((s) => (
              <Link key={s} className="chip" href={tradeHref(s)}><T fr={TRADES[s].name.fr} en={TRADES[s].name.en} /></Link>
            ))}
          </div>
        </div>
      </section>

      <ContactForm context={tr.ctx} />
    </main>
  );
}
