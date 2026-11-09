# Estalia Studio — site refait de zéro sur le modèle de Superside

Reprend la structure et le système visuel de superside.com (étudié en captures) : vert très foncé, crème,
citron vert, Inter Tight + un mot en italique Instrument Serif, hero avec mosaïque qui défile, sections
alternées, comparatif sombre avec la ligne surlignée, bento, footer en colonnes.
Contenus, textes et visuels sont ceux d'Estalia (aucun logo, texte ni image de Superside ; pas de faux clients
ni de faux témoignages).

```bash
cd site-v7 && npm install && npm run dev
npm run build
```

- Offre : abonnements (Essentiel / Croissance / Studio, bascule mensuel–annuel), 9 packs saisonniers à 290 € HT
  ou 1 990 € HT l'année. **Montants à valider.**
- Démo : `public/media/demos/boulangerie-*` (film 100 % IA généré avec Higgsfield). Les vignettes
  `public/media/tiles/` viennent de cette démo, du film de la villa et des photos du dépôt.
- Formulaire : `FORM_ENDPOINT` dans `src/form.js` (vide = e-mail prérempli).
