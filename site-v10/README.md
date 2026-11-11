# Estalia Studio — site v10 : sites « portant » pour boutiques de mode

Deux pages :

- `index.html` — la page qui vend l'offre aux boutiques (vidéo de la démo, ce qui est inclus, méthode en 14 jours, tarifs, questions, formulaire de devis).
- `demo/index.html` — la boutique de démonstration « Alba » : les vêtements pendent sur un portant, se balancent quand la souris passe, la pièce survolée se tourne vers le client. Un clic l'ouvre en aperçu rapide (devant et dos, couleurs, tailles, ajout au panier). Grille filtrable, panier latéral avec jauge de livraison offerte. Sur téléphone, le portant défile seul et se fait glisser du pouce.

Alba est une marque fictive. Les photos de `public/media/pieces/` ont été générées puis détourées (fond transparent).
La vidéo et les captures de `public/media/demo/` sont des enregistrements de la démo.

## Adapter pour une boutique cliente

1. Remplacer les photos de `public/media/pieces/` (vêtement sur cintre, fond transparent, format 660 × 876, crochet en haut au centre).
2. Remplacer le catalogue dans `src/catalogue.js` (nom, prix, texte, couleurs, vues devant et dos).
3. Changer le nom, les textes et les services dans `demo/index.html`.

## Formulaire

`src/form.js` : renseigner `FORM_ENDPOINT` (Formspree, Getform…) pour un envoi direct. Vide, le formulaire ouvre un e-mail prérempli vers `contact@estalia-studio.com`.

```
npm ci
npm run dev
npm run build
```
