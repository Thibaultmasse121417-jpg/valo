# Estalia Studio — v3 « mélange des références » (Vite + GSAP ScrollTrigger + Lenis)

> Variante de comparaison. La v2 (récit continu) reste intacte dans `../site/`.
> La v3 garde la même colonne vertébrale et y ajoute des emprunts aux sites de référence :
> bandeau des métiers lié au scroll (Heka), visite de la villa pilotée au scroll dans le vrai film
> (Archi Malin), index des films avec vidéo plein écran au titre actif et curseur « Voir »
> (Move Studio / Heka), saisons en galerie horizontale (Ayana / Vista), pastille de devis
> flottante (barre de réservation d'hôtel).
> Images de la visite : `public/media/visite/` (extraits 8–33 s et 36–42 s du film de la villa).

```bash
cd site-v3
npm install
npm run dev       # http://localhost:5173 (accessible depuis le téléphone via l'IP du réseau local)
npm run build     # génère dist/ à déployer (Vercel, Netlify, OVH…)
```

## Le récit

Un seul mouvement de caméra, du ciel jusqu'au formulaire, en alternant spectacle et calme :

1. **Hero (spectacle)** : descente pilotée au scroll, image par image dans un canvas.
   Nuages, ville, une fenêtre, puis l'intérieur. Au centre : le logo et une phrase.
2. **Studio (calme, papier)** : une image et deux lignes.
3. **ESTALIA (spectacle)** : le ciel dans les lettres ; on traverse le « I ».
4. **Métiers (spectacle)** : un univers plein écran par métier, en fondu, avec le nom seul.
5. **Ce que nous faisons (calme, nuit)** : trois lignes typographiques, aperçu vidéo au survol.
6. **Films (spectacle)** : le cadre s'ouvre jusqu'au plein écran ; chaque film se lance en grand.
7. **Saisons (calme, papier)**, **Tarifs (calme, nuit)**, **Questions (calme, papier)**.
8. **Contact (spectacle)** : le formulaire en verre dépoli flotte dans le ciel.

## Médias : ce qu'il faut tourner

Le seul vrai film est **Villa triplex, San Peïre** (`../public/videos/villa-san-peire.mp4`).
Tout le reste est **temporaire**, généré par `python3 scripts/gen_media.py` :
nuages procéduraux (`scripts/clouds.py`) et plans lents à partir des photos de `../public/images/`.
Chaque fichier porte le nom du plan à tourner. Dans le code, les emplacements sont marqués `À REMPLACER`.

| Fichier (`public/media/…`) | Plan à tourner | Où |
| --- | --- | --- |
| `videos/hero-descente-nuages-ville-interieur.mp4` | Drone/avion : au-dessus des nuages → la ville → une rue → la vitrine → on entre | Hero (voir ci-dessous) |
| `videos/ciel-nuages-boucle.mp4` | Ciel au-dessus des nuages, en boucle, 15–20 s | Lettres d'ESTALIA, transition, contact |
| `videos/metier-commerce-vitrine-et-produits.mp4` | Vitrine, produits, équipe d'un commerce | Univers Commerces, Saisons |
| `videos/metier-agence-immobiliere-visite-villa.mp4` | **Réel** (extrait du film de la villa) | Univers Agences immobilières |
| `videos/metier-camping-hotel-piscine-terrasse.mp4` | Piscine, terrasse, chambres au matin | Univers Campings & hôtels |
| `videos/metier-notaire-facade-de-l-etude.mp4` | Façade et intérieur d'une étude, portraits | Univers Notaires |
| `films/villa-san-peire.mp4` + `-extrait.mp4` | **Réel** | Film à la une (avec le son) |
| `films/film-hotel-domaine-et-jardins.mp4`, `films/film-camping-vallee-au-matin.mp4` | Vos prochains films | Portfolio |
| `images/calme-*.jpg` | **Réel** (images du film de la villa) | Respirations calmes |

Chaque vidéo a son poster `.jpg` du même nom (première image affichée).
Format conseillé : MP4 H.264, sans son (sauf films du portfolio), 1280–1920 px, 1–3 Mo,
`ffmpeg -i source.mov -vf scale=1600:-2 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart sortie.mp4`.

**Hero → images du canvas** : remplacez `public/media/hero/desktop/f_001…150.webp` (16:9)
et `public/media/hero/mobile/f_001…090.webp` (9:16) :

```bash
ffmpeg -i descente.mp4 -vf "fps=150/DUREE,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" -frames:v 150 -c:v libwebp -quality 60 public/media/hero/desktop/f_%03d.webp
ffmpeg -i descente.mp4 -vf "fps=90/DUREE,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" -frames:v 90 -c:v libwebp -quality 55 public/media/hero/mobile/f_%03d.webp
```

Si le nombre d'images change, ajustez `FRAMES`, et les légendes de la descente dans `CHAPTERS` (`src/main.js`).

## Réglages (`src/main.js`, en tête)

- `FORM_ENDPOINT` : service d'envoi du formulaire (Formspree, Getform…). Vide = e-mail prérempli vers `CONTACT_EMAIL`.
- `MOMENTS` : texte et vidéo de chaque temps fort.
- Tarifs : `index.html`, section `#tarifs` (montants **à valider**).

## Mobile et mouvement réduit

- Téléphone : même récit, effets allégés : séquence hero de 90 images en 720 px,
  épinglages plus courts, scroll tactile natif, pas d'aperçu vidéo au survol.
- `prefers-reduced-motion` : ni scroll lissé ni épinglage. Les univers deviennent des panneaux
  fixes, les vidéos ne se lancent pas seules et tout le texte est visible d'emblée.
