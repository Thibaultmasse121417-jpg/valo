"use client";

import Image from "next/image";
import { T, useLang } from "@/lib/LanguageContext";
import { useUI } from "@/lib/UIContext";
import { FILM, type Trade } from "@/data/site";

const Corners = () => (
  <>
    <span className="corner c1" /><span className="corner c2" /><span className="corner c3" /><span className="corner c4" />
  </>
);
const Disc = () => (
  <span className="disc"><svg viewBox="0 0 20 20"><path d="M4 2l14 8-14 8z" fill="currentColor" /></svg></span>
);

/**
 * Exemple de film pour un métier. Seul l'immobilier a un vrai film ;
 * les autres affichent honnêtement « Exemple à venir » et proposent le
 * film immobilier comme référence de style.
 */
export default function Example({ trade }: { trade: Trade }) {
  const { t } = useLang();
  const { openFilm } = useUI();

  if (trade.realFilm) {
    return (
      <div className="example">
        <p className="label"><T fr="Exemple — film réalisé" en="Example — finished film" /></p>
        <button type="button" className="frame" onClick={() => openFilm(0)} aria-label={t({ fr: "Lire le film Villa triplex", en: "Play the Villa triplex film" })}>
          <Image src={FILM.poster} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" />
          <Corners />
          <span className="play" aria-hidden="true"><Disc /></span>
        </button>
        <p className="small">
          <T
            fr="Villa triplex, San Peïre — 50 secondes, réalisé à partir des visuels existants du bien."
            en="Villa triplex, San Peïre — 50 seconds, made from the property’s existing visuals."
          />
        </p>
      </div>
    );
  }

  return (
    <div className="example">
      <p className="label"><T fr="Exemple à venir" en="Example coming soon" /></p>
      <button
        type="button"
        className="frame soon"
        onClick={() => openFilm(0)}
        aria-label={t({ fr: "Voir notre film immobilier en attendant", en: "Watch our real-estate film in the meantime" })}
      >
        <Image src={`/videos/sequences/seq-0${trade.still}.jpg`} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" />
        <span className="soon-veil" />
        <Corners />
        <span className="play" aria-hidden="true">
          <Disc />
          <span className="pl"><T fr="Film de référence" en="Reference film" /></span>
        </span>
      </button>
      <p className="small">
        <T
          fr={"Le premier film pour ce métier est en préparation. En attendant, voici notre film immobilier : la même attention au cadrage, au rythme et au son."}
          en="The first film for this trade is in the works. In the meantime, here is our real-estate film: the same care for framing, pacing and sound."
        />
      </p>
    </div>
  );
}
