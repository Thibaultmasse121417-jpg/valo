# Audit du site existant — Librairie Martelle (v2 → v3)

Date : 11 novembre 2026 · Périmètre : site public, administration, base de données, synchronisation.

## 1. À conserver

| Élément | Pourquoi |
|---|---|
| Étagère 3D incurvée (moteur `rAF` unique, ressort, perspective calculée, 36 livres pour 12 rayons) | Signature visuelle ; elle reste fluide parce qu’elle ne contient que les 12 rayons, et non le catalogue. |
| Transitions « feuille de papier » (`clip-path`) et révélations masquées | Effet premium, peu coûteux (GPU), compatibles avec `prefers-reduced-motion`. |
| Direction typographique Fraunces + Inter Tight, grain papier, palette brique | Identité éditoriale cohérente. |
| Contenus historiques sourcés (Livres Hebdo 2015, La Gazette 2017, La vie des livres 2017, leslibraires.fr) | Vérifiés ; chaque fait conserve sa source. |
| Schéma Supabase (RLS, bucket `media`, `apply_stock_sync`, `pos-sync`) | Sûr, testé ; base de la v3. |
| Administration (ISBN, CSV, sélections, événements, horaires) | Fonctionnelle et testée de bout en bout. |

## 2. À améliorer

| Constat | Correction v3 |
|---|---|
| `availability` valait « en stock » par défaut : une disponibilité pouvait être affichée sans source fiable. | Colonne facultative, **non renseignée par défaut** ; rien n’est affiché si elle est vide. |
| Pas de genre littéraire distinct du rayon. | Champ `genre`. |
| Suppression seulement, sans archivage. | Archivage réversible (`archived_at`), masqué du public. |
| Recherche sensible aux accents (« etranger » ≠ « Étranger »). | Colonne `search_text` sans accents + index trigramme. |
| Événements : pas d’annulation, passés mélangés aux prochains. | `cancelled` + motif ; séparation automatique « à venir » / « passés ». |
| Textes du site et photos codés en dur. | Tables `site_content` et `photos`, éditables dans l’admin. |
| Navigation centrée sur l’étagère ; pas de recherche visible. | En-tête : Accueil, Catalogue, Coups de cœur, La librairie, Événements, Contact + champ de recherche. |
| Fiches livres seulement en surcouche (`#livre-…`) : non indexables. | Pages `/livre/<isbn>-<titre>` rendues côté serveur (balises SEO, JSON-LD `Book`), plan du site `/sitemap.xml`. |
| Carte Google chargée automatiquement (cookies tiers). | Chargement sur clic (consentement), lien itinéraire toujours disponible. |
| Aucune page légale. | Mentions légales et confidentialité, éditables, avec champs à compléter signalés. |
| Livres réels de test présentés sans avertissement. | Bandeau « catalogue de démonstration » piloté depuis l’admin. |

## 3. À remplacer

| Élément | Remplacement |
|---|---|
| Fichier unique `src.html` (≈ 2 000 lignes CSS + HTML + JS) et polices en base64 (400 Ko par page). | `assets/css/`, `assets/js/` (modules ES), `assets/fonts/` (WOFF2 mis en cache) ; plusieurs pages partagent les mêmes ressources. |
| `build.py` (inclusion des polices) | `tools/fetch-fonts.py` (téléchargement unique des WOFF2). Plus d’étape de compilation pour le site. |
| Serveur `python -m http.server` pour les tests | `tools/dev-server.mjs` : fichiers statiques + rendu des fiches livres, comme en production. |

## 4. Risques identifiés

- **Indexation** : le site reste en `noindex` tant que la librairie n’a pas validé la démonstration (voir `docs/MISE-EN-PRODUCTION.md`).
- **Couvertures** : celles de Google Books ne peuvent être qu’affichées depuis Google ; celles d’Open Library sont copiées. Une couverture fournie par l’éditeur ou photographiée par la librairie reste la meilleure source.
- **Données légales** (SIRET, hébergeur, directeur de publication) : inconnues, à fournir — jamais inventées.
