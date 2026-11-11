# Mise en production — liste précise

Ce qui fonctionne **dès maintenant** (testé sur une base Supabase locale) et ce qui dépend encore d’identifiants,
d’une configuration externe ou d’une décision de la librairie.

## 1. Fonctionnel et testé

| Domaine | État |
|---|---|
| Site public : accueil (étagère 3D), catalogue (recherche titre/auteur/ISBN sans accents, filtres, tri), fiches livres indexables, événements (à venir / passés / annulés), pages légales | ✅ testé desktop + mobile |
| Administration : connexion, ajout par ISBN (Open Library ; Google Books selon quota), CSV, modification, archivage, sélections, événements (annulation, archivage automatique), textes, photos (droits), horaires, rayons | ✅ testé de bout en bout |
| Sécurité : RLS, colonnes publiques limitées, comptes hors équipe refusés, échappement HTML (test d’injection) | ✅ 22 tests automatisés |
| Synchronisation stock `pos-sync` | ✅ logique et transaction SQL testées ; ⚠️ déploiement Supabase non testé |

## 2. Nécessite des identifiants ou une configuration externe

| # | Élément | Qui | Où |
|---|---|---|---|
| 1 | Projet Supabase (région Europe) + application des 2 migrations | Estalia | `supabase db push` |
| 2 | Comptes de l’équipe (`grant_staff`) | Estalia + librairie | SQL Editor |
| 3 | Inscriptions fermées, URL du site, URL de redirection `/admin/`, **SMTP** pour « mot de passe oublié » | Estalia | Supabase → Authentication |
| 4 | `config.js` : `supabaseUrl`, `supabaseAnonKey` | Estalia | fichier |
| 5 | Hébergement Netlify + variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` | Estalia | Netlify → Site settings → Environment |
| 6 | Nom de domaine + HTTPS | Librairie / Estalia | registrar + Netlify |
| 7 | Clé Google Books (facultative, restreinte au domaine) | Estalia | Google Cloud |
| 8 | Jeton `SYNC_TOKEN` + déploiement `pos-sync` (si synchronisation) | Estalia + prestataire du logiciel de stock | `supabase secrets set`, `supabase functions deploy pos-sync --no-verify-jwt` |
| 9 | Plan Supabase avec sauvegardes quotidiennes (recommandé en production) | Librairie | Supabase → Billing |

## 3. Nécessite des informations ou une décision de la librairie

| # | Élément | Pourquoi |
|---|---|---|
| 10 | **Mentions légales** : forme juridique, SIRET, RCS, TVA, directeur·rice de la publication, hébergeur | Obligatoires ; jamais inventées (champs « À compléter » surlignés sur le site). Admin → Textes & pages. |
| 11 | **Politique de confidentialité** : validation, responsable de traitement, date | Idem. |
| 12 | **Logo officiel** | Le site utilise un logotype typographique proposé ; aucun logo officiel n’a été fourni. |
| 13 | **Photos** (devanture, rayons, équipe) avec autorisation de diffusion | Emplacements prévus ; une photo n’est publique qu’avec l’autorisation cochée. |
| 14 | **Catalogue réel** : import CSV depuis le logiciel de gestion ou ajouts par ISBN ; prix et disponibilités saisis par la librairie | Aucune donnée commerciale n’est inventée. Puis désactiver « catalogue de démonstration » (Textes & pages). |
| 15 | **Lien de commande** : boutique actuelle (leslibraires.fr) ou modèle de lien par ISBN | Admin → Horaires & infos. |
| 16 | Validation des contenus historiques et des citations | Sources indiquées ; à relire par la famille. |
| 17 | Couleurs et typographies définitives | Proposition Estalia. |

## 4. À faire le jour de la mise en ligne

1. Retirer `<meta name="robots" content="noindex,nofollow">` des pages HTML (`tools/pages.py` puis `python3 tools/pages.py` pour les sous-pages ; `index.html` à la main).
2. Remplacer `robots.txt` (modèle en commentaire dans le fichier).
3. Netlify : `SITE_INDEXABLE=true` (fiches livres indexables).
4. Déclarer `https://<domaine>/sitemap.xml` dans Google Search Console.
5. Retirer la mention « Concept proposé par Estalia — démonstration non officielle » (pied de page, intro) si la librairie le souhaite.
6. Supprimer les données de test éventuelles ; vérifier `admin_stats` (tableau de bord).

## 5. Hors périmètre de cette version (par choix)

- Paiement en ligne et confirmation automatique de réservation : non proposés ; les boutons renvoient vers la boutique existante ou ouvrent un e-mail pré-rempli. L’architecture prévoit un module de réservation ultérieur (voir `docs/ARCHITECTURE.md`).
