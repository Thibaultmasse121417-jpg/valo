# Estalia Studio — v6 « studio vidéo IA, abonnements + packs »

Site d'une page, inspiré de la logique « créatif à la demande » de Superside, à l'échelle des commerces et PME :
vidéos promo créées par IA à partir des photos du client, **sans tournage**.

```bash
cd site-v6 && npm install && npm run dev    # aperçu local
npm run build                               # site statique dans dist/
```

- **Offre** : abonnements mensuels (Essentiel, Croissance, Studio, bascule mensuel/annuel −15 %),
  9 packs saisonniers (Nouvel An → Noël, dont Black Friday) à 290 € HT ou 1 990 € HT l'année,
  et à la carte (film signature, site web, visuels IA). **Tous les montants sont à valider.**
- **Vente** : appel de 20 min à réserver (formulaire), exemple gratuit sur une photo du client,
  tableau comparatif tournage / outil IA en solo / Estalia.
- **Démo** : `public/media/demos/boulangerie-*` — film 100 % IA (Higgsfield, Kling 3.0, 4 plans) pour une boulangerie fictive.
  Les autres vidéos sont des exemples temporaires (marqués « démo à venir »).
- Formulaire : `FORM_ENDPOINT` dans `src/form.js` (vide = e-mail prérempli).
