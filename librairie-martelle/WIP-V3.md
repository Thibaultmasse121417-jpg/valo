# Refonte v3 — travail en cours (non fonctionnel)

Le site stable reste `index.html` + `admin/`. Les éléments ci-dessous préparent la refonte v3 et ne sont **pas encore branchés** :

- `docs/AUDIT.md`, `docs/ARCHITECTURE.md` : audit et architecture cible.
- `index.v3-wip.html`, `assets/` (CSS, polices WOFF2, modules JS `art.js`, `data.js`, `home.js`) : découpage du fichier unique en ressources partagées — `home.js` n’est pas encore adapté (doublons de déclarations à retirer).
- `tools/fetch-fonts.py` : polices en fichiers au lieu du base64.
- `supabase/wip/20261112090000_v3_catalogue_contenus.sql` : migration v3 (genre, archivage, recherche sans accents, disponibilité facultative, événements annulables, contenus et photos éditables). Volontairement hors de `supabase/migrations/` pour ne pas être appliquée tant que l’admin et le site ne sont pas mis à jour.

Reste à faire : vues partagées, page catalogue, fiches livres rendues côté serveur, page événements, pages légales, écrans d’administration (contenus, photos, archivage, annulation), tests.
