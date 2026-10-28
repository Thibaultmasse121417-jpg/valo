# Vidéos

| Fichier | Utilisation |
| --- | --- |
| `villa-san-peire.mp4` | Film « Villa triplex, San Peïre » — hero de l'accueil (muet, en boucle) et lecteur plein écran |
| `villa-san-peire.jpg` | Image de remplacement du film (affichée avant le chargement ou si la vidéo ne charge pas) |
| `sequences/seq-01.jpg` … `seq-08.jpg` | Images du découpage du film (une par séquence) |

Le film est encodé en H.264 + AAC, 1600 × 666 (cinémascope 2,39:1), 50 s,
avec `faststart` pour une lecture progressive. Pour remplacer le film,
gardez le même nom de fichier et le même format ; les temps des
séquences sont définis dans `data/site.ts` (`SEQUENCES`).
