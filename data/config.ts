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
  // Adresse publique du site (aperçu Vercel tant qu'aucun domaine n'est acheté).
  url: "https://estalia-studio.vercel.app",

  brand: {
    name: "ESTALIA",
    sub: "STUDIO",
    // Positionnement : films de promotion, sites web et direction
    // artistique pour les commerces et les lieux (refonte FR).
    signature: "FILMS, SITES WEB & DIRECTION ARTISTIQUE",
  },

  // Coordonnées de contact. L'adresse e-mail est celle affichée sur le
  // site (formulaire, pied de page). Téléphone et adresse restent des
  // PLACEHOLDERS et ne sont affichés nulle part tant qu'ils le sont.
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

  // Paiement — décision Phase 2 (voir docs/phase-2/payment-flow.md) :
  // seul Estalia Test (point d'entrée à faible risque, paiement unique)
  // passe par un checkout direct. Content et Pro restent "contact-first"
  // (formulaire → échange avant engagement 3 mois / mensuel) — pas de
  // checkout direct pour un abonnement récurrent avant une conversation.
  // Tant que `testCheckoutUrl` est vide, le bouton "Start with Estalia"
  // d'Estalia Test retombe sur #contact comme les deux autres offres —
  // jamais de lien cassé. Collez ici un Stripe Payment Link une fois créé.
  payment: {
    testCheckoutUrl: "",
  },

  legal: {
    company: "Estalia Studio",
  },
} as const;

export type SiteConfig = typeof siteConfig;
