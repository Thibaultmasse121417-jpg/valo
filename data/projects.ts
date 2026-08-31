/**
 * ------------------------------------------------------------------
 * RÉALISATIONS — SELECTED FILMS
 * ------------------------------------------------------------------
 * Pour remplacer un projet : changez uniquement `video` / `poster`
 * (voir /public/videos et /public/images) ou le texte ci-dessous.
 * Tant qu'un fichier vidéo/image n'existe pas, un placeholder éditorial
 * élégant est affiché automatiquement — jamais de lecteur cassé.
 * ------------------------------------------------------------------
 */

export type Project = {
  id: string;
  title: string;
  location: string;
  tags: string[];
  video: string;
  poster: string;
  /** Position en table alternée sur desktop */
  align: "left" | "right";
};

export const projects: Project[] = [
  {
    id: "chateau",
    title: "CHÂTEAU",
    location: "FRANCE",
    tags: ["HERITAGE", "CINEMATIC", "AERIAL"],
    video: "/videos/chateau.mp4",
    poster: "/images/chateau-poster.jpg",
    align: "left",
  },
  {
    id: "villa",
    title: "VILLA",
    location: "CÔTE D'AZUR",
    tags: ["MEDITERRANEAN", "CONTEMPORARY"],
    video: "/videos/villa.mp4",
    poster: "/images/villa-poster.jpg",
    align: "right",
  },
  {
    id: "paris",
    title: "APPARTEMENT",
    location: "PARIS",
    tags: ["ARCHITECTURE", "HAUSSMANN"],
    video: "/videos/paris.mp4",
    poster: "/images/paris-poster.jpg",
    align: "left",
  },
  {
    id: "domaine",
    title: "DOMAINE",
    location: "PROVENCE",
    tags: ["HERITAGE", "LANDSCAPE"],
    video: "/videos/domaine.mp4",
    poster: "/images/domaine-poster.jpg",
    align: "right",
  },
];
