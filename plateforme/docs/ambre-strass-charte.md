# Ambre & Strass — charte de marque et système de design

Démonstration de refonte pour un concept store de mode féminine (référence : boutique de prêt-à-porter
à Amiens). Ce document fixe les choix ; le code les applique via des jetons CSS (`web/src/style.css`).

## 1. Positionnement

Un concept store de centre-ville : pièces sélectionnées chaque semaine, collections courtes, prix doux
(25 à 120 €), un vestiaire qui brille « juste ce qu'il faut ». La cliente achète en ligne comme en
boutique : elle veut voir la pièce portée, connaître la matière et la taille, et savoir quand elle la reçoit.

**Promesse** : l'élégance d'une boutique de créatrice, au prix d'une boutique de quartier.

## 2. Voix

| Trait | Ce que ça veut dire | On écrit | On n'écrit pas |
|---|---|---|---|
| Chaleureuse | On parle comme la vendeuse qui conseille | « Un doute sur la taille ? Écrivez-nous. » | « Notre service client est à votre disposition. » |
| Précise | Des faits utiles, pas d'adjectifs vides | « Satin fluide, longueur 66 cm en S/M. » | « Une pièce incontournable et tendance ! » |
| Sobre | Pas de majuscules criardes, pas d'emoji, pas de points d'exclamation en série | « La collection fêtes est arrivée. » | « 🔥 NOUVEAUTÉS !!! » |
| Honnête | Jamais de promesse que le site ne tient pas | « Paiement simulé, aucune somme débitée. » | « Paiement 100 % sécurisé » (si faux) |

Tutoiement : non. Vouvoiement chaleureux, phrases courtes, typographie française (espaces fines, « », –).

## 3. Couleurs (rôles, contrastes WCAG sur ivoire #f8f4ee)

| Jeton | Valeur | Rôle | Contraste |
|---|---|---|---|
| ivoire | #f8f4ee | Fond de page | — |
| papier | #fffcf7 | Surfaces (panneaux, champs) | — |
| sable | #efe6da | Fond des photos produit, bandeaux | — |
| encre | #171412 | Texte, boutons principaux, pied de page | 16,7:1 |
| taupe | #6d645b | Texte secondaire | 5,3:1 |
| champagne | #b39770 | Décor uniquement (portant, filets, étiquette sur fond sombre) | 2,5:1, jamais pour du texte |
| champagne profond | #7a5f3c | Petits textes d'accent (précommande, sélection) | 5,4:1 |
| grenat | #8a2a1a | Prix soldés | 7,9:1 |
| erreur | #9a2c1c | Messages d'erreur | 7,0:1 |
| succès | #4f6a43 | « En stock » | 5,5:1 |

Proportions : 80 % ivoire/sable, 15 % encre, 5 % champagne. Pas de dégradé décoratif, pas d'ombre portée
sur les cartes, une seule couleur vive par écran (le grenat des soldes).

## 4. Typographie

- **Titres : Bodoni Moda** (variable, axe optique) en romain. Contraste élevé = mode, presse féminine.
- **Texte : Jost** (variable). Géométrique, lisible, chiffres tabulaires pour les prix.
- Signature : l'esperluette du logo en Bodoni italique, couleur champagne profond.

Échelle (rapport 1,25, ajustée au viewport) :

| Jeton | Usage | Taille |
|---|---|---|
| `--t-affiche` | Titre de la photo d'accueil | 44 → 84 px |
| `--t-1` | Titre de page | 40 → 72 px |
| `--t-2` | Titre de section | 32 → 56 px |
| `--t-3` | Sous-titre, nom de rayon | 22 → 28 px |
| `--t-corps` | Texte courant | 16 px (15,5 sur téléphone) |
| `--t-petit` | Métadonnées, tailles, légendes | 13–14 px |

Interlignage : 1,04–1,1 pour Bodoni, 1,55 pour Jost. Pas de capitales espacées.

## 5. Photographie

1. **Fiches produit** : pièce sur cintre, détourée, sur fond sable — homogène, le produit d'abord.
2. **Porté** : chaque pièce phare a une photo portée (lumière naturelle de fin de journée, murs enduits
   ivoire, laiton, travertin, fleurs séchées). Visage naturel, pose non figée.
3. **Boutique** : scènes réelles de vente (clientes, portant, table en chêne) pour l'ancrage local.

Ces photos sont « achetables » : un repère discret sur l'image renvoie vers la pièce portée.
Cadrages : 4:5 en éditorial, 3:4 en produit, 16:9 en bandeau. Jamais de photo de banque d'images générique.

## 6. Motifs graphiques

- Le **portant** en laiton : élément signature, réservé à la nouvelle collection.
- **Filets** 1 px couleur ligne pour structurer, jamais de cadres arrondis.
- **Repères de produit** sur les photos : point ivoire cerclé, légende au survol ou au toucher.
- Angles droits partout (boutons, étiquettes, champs) ; seul le panneau mobile a des coins arrondis
  (convention du système).

## 7. Mouvement (principes emil-design-eng)

- On anime l'**apparition des panneaux** (panier, menu, ajout rapide) et le **retour au toucher** ; pas les
  listes de produits, pas le défilement de page.
- Courbes : sortie `cubic-bezier(.23,1,.32,1)`, tiroirs `cubic-bezier(.32,.72,0,1)`. Durées 120–300 ms
  (380 ms pour un tiroir plein écran).
- Révélation des grandes photos éditoriales au défilement (clip-path), une seule fois, désactivée si
  l'utilisatrice réduit les animations.
- Effets de survol uniquement sur souris (`hover: hover` et `pointer: fine`) ; `:active` partout.

## 8. Mobile

Expérience d'application : en-tête compact, panier et recherche toujours à portée, rangées défilantes au
doigt, panneau d'ajout rapide en bas d'écran, barre d'achat collante sur la fiche, cibles de 44 px minimum,
champs à 16 px (pas de zoom iOS), zones sûres respectées.
