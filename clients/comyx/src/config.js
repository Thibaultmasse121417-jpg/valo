/* Réglages de la boutique.

   Sans Supabase (les deux champs vides) : mode démonstration. Les pièces ajoutées
   dans l'Atelier sont gardées dans le navigateur de la personne qui les ajoute.
   C'est fait pour montrer l'outil à une boutique, pas pour vendre.

   Avec Supabase : renseigner l'adresse du projet et la clé publique « anon »
   (Supabase > Project Settings > API), puis lancer supabase/schema.sql.
   Les pièces sont alors enregistrées en ligne et visibles par tous les clients. */

export const SUPABASE_URL = ''
export const SUPABASE_ANON_KEY = ''

// Identifiant de la boutique (un même projet Supabase peut servir plusieurs boutiques).
export const BOUTIQUE = 'comyx'
