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

  // Formulaire de contact — branché sur Formspree (voir components/Contact.tsx
  // pour la requête). Pour changer de service plus tard, il suffit de
  // remplacer cette URL (Resend/Supabase nécessitent de repasser par une
  // route API interne — voir l'historique de app/api/contact/route.ts).
  contactEndpoint: "https://formspree.io/f/myeykand",

  // Réservation directe d'un créneau (Calendly, Cal.com, SavvyCal…),
  // proposée sur l'écran de confirmation du funnel. Laissez `url` vide
  // ("") pour masquer complètement le bouton tant que vous n'avez pas
  // de vrai lien de réservation.
  booking: {
    url: "",
  },

  legal: {
    company: "Estalia Studio",
  },
} as const;

export type SiteConfig = typeof siteConfig;
