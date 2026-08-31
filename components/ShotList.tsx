"use client";

import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";

type ShotListProps = {
  kicker: string;
  title: string[];
  /** Un seul exemple pour la plupart des univers ; Hospitality et Business en proposent deux. */
  lists: { title: string; beats: string[] }[];
};

/**
 * Exemple(s) de plan-par-plan pour un univers — même traitement éditorial
 * que "Exemples de directions" (PropertyStyles), en 1 ou 2 colonnes selon
 * le nombre d'exemples fournis par l'univers.
 */
export default function ShotList({ kicker, title, lists }: ShotListProps) {
  const cols = lists.length >= 2 ? "sm:grid-cols-2" : "";

  return (
    <section id="shotlist" className="bg-ivoire px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="max-w-2xl">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{kicker}</p>
          </ScrollReveal>
          <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight text-noir sm:text-5xl">
            {title.map((line, i) => (
              <TitleWipe key={line} delay={0.05 + i * 0.12}>
                {line}
              </TitleWipe>
            ))}
          </h2>
        </div>

        <div className={`mt-16 grid max-w-3xl gap-14 sm:mt-20 sm:gap-10 ${cols}`}>
          {lists.map((list, i) => (
            <ScrollReveal key={list.title} delay={i * 0.08}>
              <div className="flex h-full flex-col border-t border-noir/15 pt-7">
                <h3 className="font-serif text-2xl uppercase tracking-tight text-noir">{list.title}</h3>
                <ol className="mt-7 flex flex-col gap-4">
                  {list.beats.map((beat, beatIndex) => (
                    <li key={beat} className="flex gap-4 font-sans text-sm text-noir/65">
                      <span className="mt-0.5 font-serif text-xs text-bronze">
                        {String(beatIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed">{beat}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
