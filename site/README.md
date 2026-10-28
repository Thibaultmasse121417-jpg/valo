# Estalia Studio — site vitrine (Vite + GSAP + Lenis)

```bash
cd site
npm install
npm run dev       # http://localhost:5173 (accessible depuis le téléphone via l'IP du réseau local)
npm run build     # génère dist/ à déployer (Vercel, Netlify, OVH…)
```

## Remplacer les médias temporaires

Tous les médias actuels sont **temporaires** : ils ont été fabriqués à partir des
photos de `../public/images/` (lent mouvement de caméra, `npm run media:temp`).
Sur le site, ils portent l'étiquette « Vidéo temporaire » ; dans le code, chaque
emplacement est signalé par un commentaire `À REMPLACER`.

| Fichier | Où il apparaît |
| --- | --- |
| `public/media/frames/desktop/f_001…120.webp` | Hero piloté au scroll (ordinateur, 16:9) |
| `public/media/frames/mobile/f_001…072.webp` | Hero piloté au scroll (téléphone, 9:16) |
| `public/media/videos/commerce.mp4` + `images/commerce.jpg` | Métier Commerces, portail d'entrée, portfolio, temps forts |
| `public/media/videos/immo.mp4` + `images/immo.jpg` | Métier Agences immobilières, fond des Offres, portfolio |
| `public/media/videos/camping.mp4` + `images/camping.jpg` | Métier Campings & hôtels, parallaxe, mot ESTALIA du footer |
| `public/media/videos/notaire.mp4` + `images/notaire.jpg` | Métier Notaires, Saint-Valentin, portfolio |
| `public/media/videos/hotel.mp4` + `images/hotel.jpg` | Carte de la parallaxe, Noël, fond du formulaire, portfolio |
| `public/media/images/premier-plan.jpg` | Premier plan de la parallaxe (bas d'image, fondu vers le haut) |

**Votre vidéo hero → images :** `npm run frames -- chemin/vers/hero.mp4`
(ffmpeg requis). Le script produit les deux séquences ; si vous changez le nombre
d'images, ajustez `FRAMES` dans `src/main.js`.

**Vidéos :** MP4 H.264, sans son, 1280×720 à 1920×1080, 5 à 15 s en boucle, ≈ 1–3 Mo
(`ffmpeg -i source.mov -vf scale=1600:-2 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart sortie.mp4`).
Le poster `.jpg` est la première image affichée avant lecture.

## Autres réglages (`src/main.js`, en tête de fichier)

- `FORM_ENDPOINT` : URL de votre service de formulaire (Formspree, Getform…). Vide = le
  formulaire ouvre un e-mail prérempli vers `CONTACT_EMAIL`.
- `MOMENTS` : textes et vidéo de chaque temps fort du calendrier.
- Tarifs : dans `index.html`, section `#tarifs` (montants indicatifs **à valider**).

## Effets et version allégée

- Hero en canvas image par image, portail « zoom à travers », métiers épinglés,
  parallaxe 3 calques, mot ESTALIA masqué sur vidéo, cartes en verre dépoli.
- Téléphone : séquence hero plus légère (72 images 720 px), épinglages plus courts,
  parallaxe divisée par deux, scroll natif (Lenis ne lisse que la molette), timecode masqué.
- `prefers-reduced-motion` : pas de scroll lissé, pas d'épinglage ni de scrub, vidéos
  non lues automatiquement (posters), contenus affichés dans leur état final.
