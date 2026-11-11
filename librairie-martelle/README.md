# Librairie Martelle — site vitrine administrable

Site public (carrousel 3D des 12 rayons, nouveautés, meilleures ventes, coups de cœur, événements, horaires)
et interface d’administration privée pour l’équipe de la librairie. Conçu par Estalia.

> Démonstration non officielle tant que la librairie ne l’a pas validée : le logo typographique, la palette et les
> illustrations des rayons sont des propositions. Aucune donnée commerciale n’est inventée : prix, stocks,
> sélections et événements viennent exclusivement de l’administration (ou du logiciel de stock).

---

## 1. Architecture

Voir **`docs/ARCHITECTURE.md`** (schéma, arborescence, flux de données), **`docs/AUDIT.md`** (ce qui a été conservé,
amélioré, remplacé) et **`docs/MISE-EN-PRODUCTION.md`** (liste précise des éléments manquants).

| Élément | Rôle |
|---|---|
| `index.html`, `catalogue.html`, `evenements.html`, `mentions-legales.html`, `confidentialite.html` | Pages publiques statiques (en-tête et pied de page générés par `tools/pages.py`). |
| `assets/` | Feuilles de style, polices WOFF2 (licence OFL), modules JS (`home`, `catalogue`, `events`, `legal`, `book`, partagés : `data`, `art`, `views`, `chrome`). |
| `server/book-page.mjs` + `netlify/functions/book-page.mjs` | Fiches livres `/livre/<isbn>-<titre>` rendues côté serveur (SEO, JSON-LD) et `/sitemap.xml`. |
| `config.js` | Adresse et clé **publique** Supabase (site + admin). |
| `admin/` | Administration (modules ES, sans compilation). |
| `supabase/` | Migrations (schéma, RLS, stockage) et Edge Function `pos-sync`. |
| `tests/`, `tools/` | Tests ; polices, pages, serveur de développement, données de test locales. |

### Modèle de données

- `categories` : les 12 rayons du carrousel (textes modifiables, ordre et illustration fixes).
- `books` : catalogue — ISBN-13 unique, titre, auteurs, éditeur, résumé, couverture (fichier stocké ou lien),
  prix, disponibilité, quantité, rayon, sélections (nouveauté / meilleure vente / coup de cœur + ordre),
  mot du libraire, publication, référence du logiciel de stock.
- `events` : dédicaces, rencontres, lectures, ateliers (heure de Paris, livre associé, image, lien d’inscription).
- `shop_settings` : horaires, fermetures exceptionnelles, coordonnées, liens de commande, bandeau d’annonce.
- `staff` : comptes autorisés à administrer (les autres comptes ne peuvent **rien** modifier).
- `import_jobs`, `sync_runs` : journal des imports CSV et des synchronisations.

### Sécurité

- Row Level Security sur toutes les tables : le public ne lit que les contenus publiés et des colonnes choisies
  (jamais les références internes ni la traçabilité) ; toute écriture exige un compte présent dans `staff`.
- Un compte authentifié mais non déclaré dans l’équipe est refusé (testé).
- Inscriptions publiques désactivées ; réinitialisation du mot de passe par e-mail.
- Liens contrôlés en base (`https://`, `mailto:`, `tel:` uniquement) ; tout texte est échappé à l’affichage.
- Images : formats JPEG/PNG/WebP, 5 Mo max, redimensionnées dans le navigateur avant envoi.
- La clé `service_role` n’est jamais utilisée côté navigateur ; elle ne sert qu’à l’Edge Function.
- Aucune donnée client n’est stockée (les réservations partent par e-mail vers la librairie).

---

## 2. Mise en service (environ 30 minutes)

### 2.1 Projet Supabase
1. Créez un projet sur supabase.com (région **Europe — Paris** de préférence).
2. Appliquez le schéma, au choix :
   - **CLI** : `npx supabase link --project-ref <ref>` puis `npx supabase db push` ;
   - **Tableau de bord** : *SQL Editor* → collez `supabase/migrations/20261111120000_init.sql` → *Run*.
3. *Authentication → Sign In / Providers* : désactivez « Allow new users to sign up ».
4. *Authentication → URL Configuration* : *Site URL* = adresse du site ; ajoutez `https://<votre-domaine>/admin/` aux *Redirect URLs*
   (nécessaire pour « Mot de passe oublié »). Configurez un serveur SMTP pour les e-mails en production.

### 2.2 Comptes de l’équipe
1. *Authentication → Users → Add user* (e-mail + mot de passe, « Auto Confirm »).
2. *SQL Editor* :
   ```sql
   select public.grant_staff('libraire@librairiemartelle.com', 'Prénom Nom', 'owner');
   ```
   Pour retirer un accès : `delete from public.staff where user_id = (select id from auth.users where email = '…');`

### 2.3 Configuration du site
Dans `config.js`, renseignez `supabaseUrl` et `supabaseAnonKey` (*Project Settings → API*, clé « anon » / « publishable »).
Facultatif : `googleBooksApiKey` (Google Cloud → API Books ; **restreignez la clé au domaine du site**). Sans clé,
Google limite fortement les recherches et Open Library prend le relais.

### 2.4 Hébergement (Netlify recommandé)
Reliez le dépôt à Netlify (dossier `librairie-martelle/` comme base) : `netlify.toml` publie les pages statiques et la
fonction des fiches livres. Variables d’environnement : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL`
(et `SITE_INDEXABLE=true` à la mise en ligne officielle). L’administration est accessible à `https://<domaine>/admin/`.
Autre hébergeur : le rendu des fiches (`server/book-page.mjs`, `(Request, env) → Response`) s’adapte à Vercel ou Cloudflare.

### 2.5 Synchronisation du stock (facultatif)
```bash
npx supabase secrets set SYNC_TOKEN="$(openssl rand -hex 32)"
npx supabase functions deploy pos-sync --no-verify-jwt
```

---

## 3. Utilisation par la librairie

| Besoin | Où |
|---|---|
| Ajouter un livre | *Ajouter un livre* : saisir, scanner (caméra du téléphone) ou « biper » l’ISBN avec une douchette → les infos et la couverture sont proposées → choisir le rayon et le prix → *Enregistrer*. |
| Modifier prix / disponibilité / rayon | *Livres* : recherche, filtres, modification groupée (rayon, disponibilité, publication, sélections, suppression). |
| Nouveautés, meilleures ventes, coups de cœur | *Sélections* : ajout par recherche, ordre ↑ ↓, mot du libraire. Ou cases à cocher dans la fiche du livre. |
| Importer des centaines de livres | *Importer (CSV)* : modèle téléchargeable, colonnes reconnues automatiquement (Excel FR, `;`), vérification ligne par ligne, mise à jour par ISBN, complétion automatique par ISBN, rapport d’erreurs. Jusqu’à 5 000 lignes par fichier. |
| Événements | *Événements* : création, image, livre associé, inscription, duplication. |
| Horaires, fermetures, bandeau | *Horaires & infos*. |
| Textes des 12 rayons | *Les 12 rayons*. |
| Sauvegarde du catalogue | *Livres → Exporter (CSV)*. |

Tout est visible **immédiatement** sur le site public (aucun cache côté site ; un onglet resté ouvert se rafraîchit à son retour au premier plan).

---

## 4. Synchronisation avec le logiciel de gestion de stock

L’Edge Function `pos-sync` reçoit les stocks et les prix depuis le logiciel de la librairie (ou depuis un petit script
du prestataire informatique exécuté chaque nuit / chaque heure).

```
POST https://<ref>.supabase.co/functions/v1/pos-sync
Authorization: Bearer <SYNC_TOKEN>
Content-Type: application/json

{ "source": "logiciel-de-caisse", "create_missing": false,
  "items": [ { "isbn": "9782070360024", "price": 8.9, "stock_qty": 4 },
             { "external_ref": "A-000123", "availability": "on_order" } ] }
```

- Identification par `isbn` (ISBN-10/13, tirets acceptés) ou, à défaut, par `external_ref` (référence article).
- Mis à jour : `price`, `stock_qty`, `availability` (déduite de la quantité si absente : 0 → indisponible, 1–2 → stock faible,
  3+ → en stock ; « sur commande » et « à paraître » sont préservés quand le stock tombe à 0).
- **Jamais modifiés** : titres, résumés, rayons, sélections, mots du libraire, publication.
- `create_missing: true` crée les ISBN inconnus en **brouillon** (non publiés) pour que l’équipe les complète.
- 1 000 articles par appel ; réponse `{ received, updated, created, unknown, errors }` ; chaque appel est journalisé
  (*Synchronisation stock* dans l’admin).
- Tout se fait en une transaction SQL (`public.apply_stock_sync`, exécutable uniquement par la clé de service).

Si le logiciel ne sait qu’exporter un fichier, l’import CSV de l’administration fait le même travail (mise à jour par ISBN).

---

## 5. Développement et tests

```bash
# Base locale complète (Postgres, Auth, Storage, API) — nécessite Docker
npx supabase start
# (Si public.ecr.aws est inaccessible : SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io npx supabase start)

# Tests unitaires (ISBN, CSV, prix)
node --test tests/unit.test.mjs
# Règles v3 (archivage, photos, contenus, fiches livres SSR) — même environnement que ci-dessous : node --test tests/v3.test.mjs

# Tests d’intégration (sécurité RLS, doublons, sélections, synchronisation) contre la base locale
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… \
STAFF_EMAIL=… STAFF_PASSWORD=… OTHER_EMAIL=… OTHER_PASSWORD=… node --test tests/backend.test.mjs

# Serveur local identique à la production (pages + fiches livres /livre/…)
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=… node tools/dev-server.mjs 8080

# En-tête / pied de page modifiés : régénérer les sous-pages et le gabarit serveur
python3 tools/pages.py
```

## 6. Limites connues et évolutions prévues

- Couvertures Google Books : affichées depuis Google (conditions d’utilisation de l’API) ; les couvertures Open Library
  sont copiées dans le stockage de la librairie. L’équipe peut toujours importer sa propre photo.
- Source BnF (catalogue général, licence ouverte) : à ajouter côté serveur (pas d’accès direct depuis le navigateur).
- Rôles : `owner` et `editor` ont aujourd’hui les mêmes droits ; une gestion fine (ex. lecture seule) peut être activée sans refonte.
- Pas de paiement en ligne, par choix : les boutons « Commander » renvoient vers la boutique en ligne configurée, et
  « Réserver » envoie une demande par e-mail à la librairie.
