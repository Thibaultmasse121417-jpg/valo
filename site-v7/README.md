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

- Offre : onglet Commerces (Essentiel 490 €, Croissance 990 €, Studio 1 990 € par mois, −15 % en annuel ; packs saisonniers 390 € ou 2 790 € l'année) et onglet Immobilier (149 € par bien, Agence 5 à 590 €, Agence 10 à 990 €, Agence 20 à 1 690 € par mois, prestige dès 790 €). Prix HT **à valider**.
- Démo : `public/media/demos/boulangerie-*` (film 100 % IA généré avec Higgsfield). Les vignettes
  `public/media/tiles/` viennent de cette démo, du film de la villa et des photos du dépôt.
- Formulaire : `FORM_ENDPOINT` dans `src/form.js` (vide = e-mail prérempli).
