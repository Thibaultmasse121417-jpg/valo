/**
 * ------------------------------------------------------------------
 * CONFIGURATION CENTRALE — ESTALIA STUDIO
 * ------------------------------------------------------------------
 * Toutes les coordonnées, tous les réseaux sociaux et les informations
 * du fondateur sont centralisés ici. Il n'y a aucune autre valeur en
 * dur dans le reste du code : modifiez uniquement ce fichier.
 *
 * ⚠️  Les valeurs ci-dessous sont des PLACEHOLDERS explicites.
 *     Remplacez-les par vos vraies coordonnées avant mise en ligne.
 * ------------------------------------------------------------------
 */

export const siteConfig = {
  brand: {
    name: "ESTALIA",
    sub: "STUDIO",
    signature: "CINEMATIC REAL ESTATE",
  },

  // Coordonnées de contact — PLACEHOLDERS, à remplacer.
  contact: {
    email: "contact@estalia-studio.com",
    phone: "+33 0 00 00 00 00",
    phoneDisplay: "+33 (0)0 00 00 00 00",
    address: "Paris, France",
  },

  // Réseaux sociaux — PLACEHOLDERS, à remplacer par vos vraies URLs.
  social: {
    instagram: "https://instagram.com/estaliastudio",
    linkedin: "https://linkedin.com/company/estalia-studio",
  },

  // Fondateur — remplacez la photo dans /public/images/founder.jpg
  founder: {
    name: "Thibault Masse",
    photo: "/images/founder.jpg",
    // Coordonnées directes du fondateur — PLACEHOLDERS, à remplacer.
    phone: "+33 0 00 00 00 00",
    email: "contact@estalia-studio.com",
    linkedin: "https://linkedin.com/company/estalia-studio",
  },

  // Formulaire de contact — voir app/api/contact/route.ts pour brancher
  // un vrai service d'envoi (Resend, Formspree, Supabase, etc.)
  contactEndpoint: "/api/contact",

  legal: {
    company: "Estalia Studio",
  },
} as const;

export type SiteConfig = typeof siteConfig;
