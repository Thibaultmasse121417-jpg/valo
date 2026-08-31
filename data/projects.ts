/**
 * ------------------------------------------------------------------
 * RÉALISATIONS — SELECTED FILMS
 * ------------------------------------------------------------------
 * Pour remplacer un projet : changez uniquement `video` / `poster`
 * (voir /public/videos et /public/images) ou le texte ci-dessous.
 * Tant qu'un fichier vidéo/image n'existe pas, un placeholder éditorial
 * élégant est affiché automatiquement — jamais de lecteur cassé.
 *
 * `universes` détermine sur quelle(s) landing page(s) le projet apparaît
 * (voir data/universes.ts) — la homepage affiche toujours la liste
 * complète, mélangée.
 * ------------------------------------------------------------------
 */

import type { UniverseId } from "./universes";

export type Project = {
  id: string;
  title: string;
  location: string;
  tags: string[];
  video: string;
  poster: string;
  /** Position en table alternée sur desktop */
  align: "left" | "right";
  universes: UniverseId[];
};

export const projects: Project[] = [
  {
    id: "chateau",
    title: "CHÂTEAU",
    location: "Normandie, France",
    tags: ["HERITAGE", "REAL ESTATE"],
    video: "/videos/real-estate/chateau.mp4",
    poster: "/images/chateau-poster.jpg",
    align: "left",
    universes: ["real-estate"],
  },
  {
    id: "villa",
    title: "VILLA",
    location: "Côte d'Azur, France",
    tags: ["ARCHITECTURE", "REAL ESTATE"],
    video: "/videos/real-estate/villa.mp4",
    poster: "/images/villa-poster.jpg",
    align: "right",
    universes: ["real-estate"],
  },
  {
    id: "paris",
    title: "APPARTEMENT",
    location: "Paris, France",
    tags: ["ARCHITECTURE", "REAL ESTATE"],
    video: "/videos/real-estate/paris.mp4",
    poster: "/images/paris-poster.jpg",
    align: "left",
    universes: ["real-estate"],
  },
  {
    id: "domaine",
    title: "DOMAINE",
    location: "Provence, France",
    tags: ["WEDDING", "HOSPITALITY"],
    video: "/videos/wedding/domaine.mp4",
    poster: "/images/domaine-poster.jpg",
    align: "right",
    universes: ["wedding-venues", "real-estate"],
  },
  {
    id: "boutique-hotel",
    title: "BOUTIQUE HOTEL",
    location: "Paris, France",
    tags: ["HOSPITALITY"],
    video: "/videos/hospitality/boutique-hotel.mp4",
    poster: "/images/boutique-hotel-poster.jpg",
    align: "left",
    universes: ["hospitality"],
  },
  {
    id: "restaurant",
    title: "RESTAURANT",
    location: "Paris, France",
    tags: ["HOSPITALITY"],
    video: "/videos/hospitality/restaurant.mp4",
    poster: "/images/restaurant-poster.jpg",
    align: "right",
    universes: ["hospitality"],
  },
  {
    id: "showroom",
    title: "SHOWROOM",
    location: "Paris, France",
    tags: ["AUTOMOTIVE", "BUSINESS"],
    video: "/videos/business/showroom.mp4",
    poster: "/images/showroom-poster.jpg",
    align: "left",
    universes: ["business"],
  },
];

/** Projets d'un univers donné — utilisé sur chaque landing page dédiée. */
export function projectsFor(universe: UniverseId): Project[] {
  return projects.filter((p) => p.universes.includes(universe));
}
