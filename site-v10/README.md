# Estalia Studio — site v10 : sites « portant » pour boutiques de mode

Trois pages :

- `index.html` : la page qui vend l'offre aux boutiques (vidéo de la démo, ce qui est inclus, l'Atelier, méthode en 14 jours, tarifs, questions, devis).
- `demo/` : la boutique de démonstration « Alba ». Les vêtements pendent sur un portant, se balancent au passage de la souris, et la pièce survolée se tourne vers le client. Un clic ouvre l'aperçu rapide (devant et dos, couleurs, tailles, panier). La grille est filtrable, le panier latéral affiche la jauge de livraison offerte. Sur téléphone, on fait glisser le portant du pouce.
- `atelier/` : l'espace de la boutique pour **ajouter ses pièces elle-même**, depuis son téléphone, sans photographe.

## L'Atelier

1. La boutique prend la pièce en photo sur un cintre (ou choisit une photo existante).
2. Le fond est enlevé automatiquement **dans le navigateur** : la photo n'est envoyée à aucun service de détourage et rien n'est facturé à la pièce. L'outil (44 Mo) se télécharge à la première utilisation, puis reste en cache sur l'appareil.
3. La pièce est cadrée comme les autres. Si la photo n'a pas de cintre visible, un cintre en bois est ajouté. Une gomme et un pinceau « restaurer » corrigent un détail.
4. La couleur est reconnue et nommée (modifiable). Pour chaque couleur, on peut ajouter une photo du dos.
5. On renseigne le nom, le prix, la catégorie et les tailles, puis on enregistre : la pièce apparaît sur la boutique.

Depuis la liste, on règle l'ordre (les 12 premières pièces en ligne vont sur le portant, toutes vont dans la grille), on masque une pièce épuisée, on modifie ou on supprime.

Modèle de détourage : `silueta` (famille U²-Net, licence Apache 2.0), exécuté avec onnxruntime-web (licence MIT). Fichiers : `public/models/` et `public/ort/`. Code : `src/detourage.js` et `src/detourage.worker.js`.

## Où sont rangées les pièces

Réglages dans `src/config.js`.

- **Mode démonstration** (par défaut, Supabase non renseigné) : les pièces ajoutées restent dans le navigateur de la personne qui les ajoute. C'est fait pour la démo : un prospect ajoute une de ses pièces et la voit sur le portant. La démo part du catalogue Alba (`src/catalogue.js`), et un bouton la remet à zéro.
- **Mode en ligne** (boutique d'un client) : créer un projet Supabase dédié, lancer `supabase/schema.sql` dans le SQL Editor, créer le compte de la boutique (Authentication > Users), le relier à la boutique dans la table `gerants`, puis renseigner `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `BOUTIQUE` dans `src/config.js`. L'Atelier demande alors une connexion. Les photos vont dans le dossier public `pieces`, et chaque compte n'écrit que dans sa boutique.

Le code du mode en ligne (`src/donnees.js`) n'a pas encore été testé sur un vrai projet Supabase.

## Formulaire de devis

`src/form.js` : renseigner `FORM_ENDPOINT` (Formspree, Getform…) pour un envoi direct. Laissé vide, le formulaire ouvre un e-mail prérempli vers `contact@estalia-studio.com`.

```
npm ci
npm run dev
npm run build
```
