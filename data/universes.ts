/**
 * ------------------------------------------------------------------
 * UNIVERS — structure des 4 expertises Estalia Studio
 * ------------------------------------------------------------------
 * Données structurelles uniquement (identifiants, routes, médias).
 * Tout le texte éditorial de chaque univers vit dans data/content.ts
 * (clé `universes`), par langue — c'est le seul endroit à modifier
 * pour changer la copie d'une landing page.
 *
 * Pour déposer une vidéo : voir /public/videos/{dossier}/README.md
 * ------------------------------------------------------------------
 */

export type UniverseId = "real-estate" | "wedding-venues" | "hospitality" | "business";

export type UniverseMeta = {
  id: UniverseId;
  /** Chemin de route, ex. "/real-estate" */
  path: string;
  /** Dossier vidéo, ex. "real-estate" → /videos/real-estate/*.mp4 */
  videoFolder: string;
  hero: { video: string; poster: string };
};

export const universes: UniverseMeta[] = [
  {
    id: "real-estate",
    path: "/real-estate",
    videoFolder: "real-estate",
    hero: { video: "/videos/real-estate/hero.mp4", poster: "/images/chateau-poster.jpg" },
  },
  {
    id: "wedding-venues",
    path: "/wedding-venues",
    videoFolder: "wedding",
    hero: { video: "/videos/wedding/hero.mp4", poster: "/images/domaine-poster.jpg" },
  },
  {
    id: "hospitality",
    path: "/hospitality",
    videoFolder: "hospitality",
    hero: { video: "/videos/hospitality/hero.mp4", poster: "" },
  },
  {
    id: "business",
    path: "/business",
    videoFolder: "business",
    hero: { video: "/videos/business/hero.mp4", poster: "" },
  },
];

export function getUniverse(id: UniverseId): UniverseMeta {
  const found = universes.find((u) => u.id === id);
  if (!found) throw new Error(`Unknown universe id: ${id}`);
  return found;
}
