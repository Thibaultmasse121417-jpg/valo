/*
 * Configuration du site Librairie Martelle (site public + administration).
 *
 * supabaseUrl / supabaseAnonKey : Supabase → Project Settings → API.
 * La clé « anon » (ou « publishable ») est publique par conception : toutes les
 * protections sont appliquées côté base de données (Row Level Security).
 * Ne mettez JAMAIS la clé « service_role » / « secret » dans ce fichier.
 *
 * googleBooksApiKey (facultatif) : clé Google Books API pour la recherche par ISBN
 * (sans clé, Google limite fortement le nombre de requêtes).
 *
 * Laissez supabaseUrl vide pour afficher le site en mode démonstration.
 */
window.MARTELLE_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  googleBooksApiKey: "",
};
