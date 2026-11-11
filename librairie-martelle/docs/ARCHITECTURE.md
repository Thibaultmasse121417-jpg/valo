# Architecture — Librairie Martelle v3

## Vue d’ensemble

```
Navigateur ──► Hébergeur statique (Netlify recommandé)
                 ├─ /                       index.html        accueil : étagère 3D des 12 rayons
                 ├─ /catalogue.html         catalogue : recherche, filtres, tri, pagination
                 ├─ /livre/<isbn>-<titre>   fiche livre rendue côté serveur (Netlify Function)
                 ├─ /evenements.html        rendez-vous à venir + archives
                 ├─ /mentions-legales.html, /confidentialite.html
                 ├─ /sitemap.xml            généré à la demande (Netlify Function)
                 └─ /admin/                 administration (session Supabase)
                          │
                          ▼
               Supabase (projet de la librairie)
                 ├─ Postgres + Row Level Security   catalogue, rayons, événements, contenus, photos, réglages
                 ├─ Auth                            comptes de l’équipe (inscriptions fermées)
                 ├─ Storage « media »               couvertures, affiches, photos (public en lecture)
                 └─ Edge Function « pos-sync »      stocks et prix envoyés par le logiciel de gestion
```

## Arborescence

```
index.html  catalogue.html  evenements.html  mentions-legales.html  confidentialite.html  config.js  robots.txt
assets/
  css/fonts.css  css/site.css
  fonts/*.woff2                      Fraunces, Inter Tight (SIL Open Font License)
  js/data.js       accès public à l’API (lecture seule), formats, réglages, contenus
  js/art.js        illustrations SVG des rayons et couvertures de repli
  js/chrome.js     en-tête, recherche, menu mobile, pied de page, bandeau d’annonce
  js/home.js       étagère 3D et sections de l’accueil
  js/catalogue.js  catalogue
  js/events.js     page événements
  js/legal.js      pages légales
server/book-page.mjs                 rendu HTML des fiches livres + sitemap (Request → Response, sans dépendance)
netlify/functions/book-page.mjs      adaptateur Netlify (routes /livre/* et /sitemap.xml)
admin/                               administration (modules ES, supabase-js 2.45.4 inclus)
supabase/migrations/                 schéma versionné
supabase/functions/pos-sync/         synchronisation du stock
tests/                               tests unitaires et d’intégration
tools/                               polices, serveur de développement, données de test locales
```

## Flux de données

- **Lecture publique** : clé `anon` + RLS. Le public ne voit que les livres publiés et non archivés, les événements publiés,
  les photos publiées *et* dont les droits sont confirmés, et une liste blanche de colonnes.
- **Écriture** : uniquement par un compte présent dans `public.staff` (testé : un compte authentifié hors équipe est refusé).
- **Affichage immédiat** : aucune page ne met en cache les données plus de 60 s (`s-maxage=60` pour les fiches livres).
- **Synchronisation stock** : `pos-sync` (jeton secret) → `apply_stock_sync()` en une transaction ; ne touche ni aux textes ni aux sélections.

## Évolutions prévues

| Évolution | Point d’ancrage |
|---|---|
| Module de réservation (demande → confirmation par la librairie) | Table `reservation_requests` + Edge Function d’envoi d’e-mail ; le bouton « Réserver » des fiches pointe aujourd’hui vers un e-mail pré-rempli, remplacé sans changer les pages. Pas de confirmation automatique tant que la librairie ne valide pas le stock. |
| Catalogue complet depuis le logiciel de gestion | `pos-sync` avec `create_missing: true` (brouillons) ou import CSV planifié. |
| Métadonnées BnF / Electre / Dilicom | Recherche ISBN côté serveur (Edge Function), même format que `admin/js/isbn.js`. |
| Paiement en ligne | Hors périmètre ; les liens de commande renvoient vers la boutique existante de la librairie. |
