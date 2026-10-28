# Refonte FR — studio de films et de sites pour les commerces et les lieux

Le site passe d'un lancement « hôtels UK » (anglais par défaut) à un site
français, pensé pour obtenir des demandes de devis : commerces, agences
immobilières, campings & hôtels, notaires.

## Direction artistique

- **Ambiance** : « salle de projection » — fond très sombre, film en plein
  écran dans le hero, format cinémascope, un seul accent orangé (numéros,
  timecodes, point « en lecture »).
- **Typographie** : Cormorant Garamond (titres, composés ligne par ligne,
  italique ponctuel) + Manrope (texte, navigation, boutons). Chargées avec
  `next/font`.
- **Animations** : apparitions lentes au défilement, retour visuel à
  l'appui sur les boutons, effets de survol réservés à la souris ; avec
  « réduire les animations », seuls les fondus restent et le film ne
  démarre pas tout seul.

## Validation ui-ux-pro-max

Recherche `--design-system` (« creative video production studio cinematic
premium dark ») puis recherches ciblées :

- retenu : style **Exaggerated Minimalism** (typographie surdimensionnée,
  beaucoup d'espace, un seul accent, sombre possible — cité pour agences
  et marques de luxe) ; **Cormorant** confirmée pour les titres ; motif
  « CTA à la fin de chaque chapitre + CTA final » ; règles Next.js
  (`next/font`, `next/image`, `priority` sur l'image du hero seulement).
- écarté : la palette « Creative Agency » (rose/cyan) et le style
  « Liquid Glass » (pensé pour les interfaces Apple), hors sujet pour un
  studio cinéma ; l'accent doré remplacé par l'accent orangé demandé.
- aucune correspondance dans la base pour « landing page de devis » :
  structure décidée à partir du brief du fondateur.

## Contenu et honnêteté

- Un seul vrai film (Villa triplex, immobilier). Les autres métiers
  affichent « Exemple à venir » avec ce film comme référence de style.
- Les 4 images d'« études » sont présentées comme propositions
  conceptuelles, pas comme des commandes clients.
- Tarifs : « Sur devis » tant que le fondateur n'a pas fixé ses prix.
- Le formulaire n'annonce un envoi réussi que si Formspree le confirme ;
  sinon le visiteur peut copier son message et l'envoyer par e-mail.

## Pages

| Adresse | Contenu |
| --- | --- |
| `/` | Accueil : film, vidéos promo, métiers, saisons, sites web, méthode, tarifs, studio, FAQ, devis |
| `/metiers/[commerces, agences-immobilieres, campings-hotels, notaires]` | Page par métier |
| `/sites-web` | Approche du site web |
| `/mentions-legales`, `/confidentialite` | En français, champs `[ à compléter ]` |

Les anciennes adresses (`/real-estate`, `/hospitality`, `/wedding-venues`,
`/business`) redirigent vers leur équivalent.

## Reste à fournir

Prix des formules, contenu exact des formules, champs des mentions
légales, un film exemple par métier, un portrait pour la section Studio.
