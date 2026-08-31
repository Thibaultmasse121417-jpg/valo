import { siteConfig } from "@/data/config";

/**
 * ------------------------------------------------------------------
 * MARQUE — lockup monogramme + wordmark
 * ------------------------------------------------------------------
 * Un seul composant source pour la marque affichée dans le site (header,
 * footer). Reste strictement typographique (aucune icône maison/caméra/
 * drone, conformément à l'identité définie), mais avec un vrai signe
 * graphique : le monogramme "E" posé dans un petit cadre à coins ouverts
 * qui reprend le motif "viewfinder" utilisé au survol des films — la
 * marque et le reste du site partagent le même langage visuel.
 *
 * Pour un logo à télécharger et utiliser hors du site (réseaux sociaux,
 * signature email, présentation), voir /public/logo/ — fichiers SVG/PNG
 * autonomes, avec la police embarquée pour un rendu fidèle partout.
 * ------------------------------------------------------------------
 */

type LogoProps = {
  /** "dark" = texte noir (posé sur fond clair) · "light" = texte ivoire (posé sur fond sombre) */
  tone?: "dark" | "light";
  className?: string;
};

export default function Logo({ tone = "dark", className = "" }: LogoProps) {
  const textColor = tone === "dark" ? "text-noir" : "text-ivoire";
  const subColor = tone === "dark" ? "text-noir/50" : "text-ivoire/60";
  const frameColor = tone === "dark" ? "border-noir/25" : "border-ivoire/35";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center border transition-colors duration-500 sm:h-8 sm:w-8 ${frameColor}`}
      >
        <span className="font-serif text-sm text-bronze sm:text-base">E</span>
      </span>
      <span className="flex items-baseline gap-2 font-serif leading-none">
        <span
          className={`text-xl tracking-widest2 transition-colors duration-500 sm:text-2xl ${textColor}`}
        >
          {siteConfig.brand.name}
        </span>
        <span
          className={`font-sans text-[10px] uppercase tracking-widest2 transition-colors duration-500 ${subColor}`}
        >
          {siteConfig.brand.sub}
        </span>
      </span>
    </span>
  );
}
