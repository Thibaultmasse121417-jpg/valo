// Templates of the legal pages: missing facts are marked « À compléter », never invented.
const TODO = (what) => `[À compléter : ${what}]`;

export const legalTemplates = (SHOP) => ({
  "legal.mentions": () => `## Éditeur du site
Librairie Martelle — ${TODO("forme juridique et capital")}
3 rue des Vergeaux, 80000 Amiens
Téléphone : ${SHOP.phone} — E-mail : ${SHOP.email}
SIRET : ${TODO("numéro SIRET")} — RCS : ${TODO("ville et numéro RCS")}
TVA intracommunautaire : ${TODO("numéro de TVA")}

## Directeur de la publication
${TODO("nom du directeur ou de la directrice de la publication")}

## Hébergement
Site : ${TODO("nom, adresse et téléphone de l’hébergeur du site")}
Base de données et images : Supabase Inc. — ${TODO("région d’hébergement choisie pour le projet")}

## Conception
Conception et réalisation : Estalia.

## Propriété intellectuelle
Les textes, photographies et éléments graphiques du site sont protégés. Les couvertures de livres sont reproduites pour présenter les ouvrages proposés à la vente ; elles restent la propriété de leurs éditeurs et illustrateurs.`,
  "legal.privacy": () => `## Données collectées
Le site ne propose ni compte client ni paiement. Il ne collecte aucune donnée personnelle lors de la consultation du catalogue.
Les demandes de réservation et de renseignements sont envoyées par e-mail depuis votre propre messagerie : elles sont traitées par la librairie pour vous répondre et ne sont pas conservées par le site.

## Cookies et services tiers
Aucun cookie de mesure d’audience ou publicitaire n’est déposé.
La carte Google Maps n’est chargée que si vous cliquez sur « Afficher la carte » ; Google peut alors déposer des cookies (voir la politique de confidentialité de Google).
Les couvertures de certains livres peuvent être affichées depuis Google Books ou Open Library.

## Espace d’administration
L’espace réservé à l’équipe de la librairie utilise un cookie technique de session, nécessaire à la connexion.

## Vos droits
Pour toute question relative à vos données : ${SHOP.email} — ${TODO("adresse postale de contact et nom du responsable de traitement si différent")}.
Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).

Dernière mise à jour : ${TODO("date de validation par la librairie")}`,
});
