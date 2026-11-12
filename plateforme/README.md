# Plateforme « portant » — boutiques de mode multi-commerçants

Une seule application sert toutes les boutiques. Chaque commerçant a son nom de domaine, son compte administrateur, son catalogue, ses stocks, ses commandes, son logo et ses couleurs. Les données de chaque boutique sont isolées dans la base.

Ce dossier est indépendant de `site-v10/` (page de vente et démo statique), qui reste tel quel.

## Ce que fait la plateforme

**Pour le commerçant (`/admin/`)**
- Ajouter un vêtement : importer une ou plusieurs photos (glisser-déposer ou appareil photo du téléphone).
- Détourage automatique sur le serveur. Chaque photo garde trois fichiers : l'original, le masque, et l'image optimisée pour le portant (WebP 660 × 876, cadrée, sur un cintre virtuel), plus une vignette.
- La couleur est reconnue et proposée.
- Correction manuelle si l'IA se trompe : gomme et pinceau sur le détourage, taille et position sur le cintre, cintre ajouté ou conservé.
- Nom, référence, type, prix, description, étiquette « Nouveau ».
- Tailles (courantes ou personnalisées) et couleurs.
- Stock par taille et par couleur, avec une référence (SKU) par variante générée automatiquement : `PULL-MTM-OCRE-M`.
- Mettre en ligne ou masquer, modifier, supprimer, et régler l'ordre du portant (les 12 premiers vêtements en ligne vont sur le portant).
- Collections : créer, renommer, masquer, supprimer, y ranger les vêtements. Elles servent de filtres dans la boutique.
- Commandes : liste « à traiter », détail (client, adresse, articles avec référence), suivi (en préparation, expédiée, retirée, annulée avec remise en stock).
- Boutique : nom, accroche, logo, couleurs (fond, texte, accent), prix de livraison, seuil de livraison offerte, retrait en boutique, paiement (Stripe ou test), domaines reliés.

**Pour le client (`/`)**
- Vêtements suspendus sur une tringle, qui se balancent ; la pièce survolée se tourne vers soi. Navigation fluide, glisser au doigt sur téléphone.
- Clic : la fiche s'ouvre, avec devant et dos si les photos existent, les couleurs, les tailles (tailles épuisées barrées) et l'ajout au panier.
- Panier, commande (livraison ou retrait en boutique), paiement, page de confirmation et de suivi.
- Prix, stock et frais de livraison sont toujours recalculés par le serveur. Le stock est réservé pendant 30 minutes au moment de la commande, puis rendu si le paiement n'aboutit pas. Deux clients ne peuvent pas acheter la même dernière pièce.

## Créer une nouvelle boutique (sans toucher au code)

Tout ce qui distingue une boutique d'une autre se règle dans son administration, onglet **Boutique** :
- **Identité** : nom, logo (sinon le nom s'écrit dans la police des titres), six couleurs (fond, cartes, texte, texte discret, accent, bandeaux), police des titres (Cormorant, Playfair, DM Serif, Inter Tight), police du texte, titres en italique ou non.
- **Page d'accueil** : annonces du bandeau, image et textes de la bannière, titre et texte du portant.
- **La boutique** : photo, présentation, adresse, horaires, téléphone, e-mail, réseaux sociaux, texte du pied de page.
- **Livraison, retrait, paiement.**

Les produits, collections et promotions se gèrent dans les onglets Produits et Collections.

Étapes :
1. `npm run boutique:creer -- --slug ma-boutique --nom "…" --domaine ma-boutique.fr --email … --mdp "…"`
2. La commerçante se connecte sur `https://ma-boutique.fr/admin/`, règle l'onglet Boutique et ajoute ses produits.

`tests/creer-ambre.js` fait exactement cela par l'API pour la boutique de démonstration **Ambre & Strass** : réglages, 3 collections, 22 produits (photo → détourage serveur → fiche → stock → en ligne), 3 commandes payées.

### Page d'accueil de la boutique
Bannière, portant interactif (vêtements sur cintre, 12 premiers), collections, nouveautés, catégories, coups de cœur (ventes réelles, puis produits mis en avant), promotions (prix barré, pourcentage), catalogue filtrable par catégorie, collection ou promotion, triable par nouveauté, popularité ou prix, présentation de la boutique, services et pied de page complet.

### Catégories
Blouses et chemisiers, Pulls et sweats, Tops et t-shirts, Vestes et manteaux, Pantalons et shorts, Robes et jupes, Combinaisons et ensembles (sur cintre, sur le portant) ; Bijoux, Sacs, Chaussures (accessoires : photo détourée et posée au centre, sans cintre, dans la boutique mais pas sur le portant) ; Promotions (tout produit avec un prix soldé). La liste est dans `serveur/vitrine.js`.

### Promotions
Dans la fiche produit, un **prix soldé** inférieur au prix normal met le produit en promotion. La boutique affiche alors le prix barré et le pourcentage, et le paiement se fait au prix soldé (calculé par le serveur).

## Isolation des boutiques

- La boutique est reconnue au **nom de domaine** de la requête (table `domaines`).
- Chaque table métier porte `boutique_id`. L'application se connecte avec le rôle PostgreSQL `portant_app`, soumis à la **sécurité au niveau des lignes** (RLS, avec FORCE). Une transaction ne voit que la boutique déclarée (`app.boutique_id`). Sans boutique déclarée, elle ne voit rien, et elle ne peut pas écrire dans une autre boutique.
- Sessions d'administration liées à une boutique. Cookie `HttpOnly` et `SameSite=Lax`, en-tête anti-CSRF obligatoire pour les écritures. Mots de passe hachés avec scrypt. Nombre d'essais de connexion limité.
- Fichiers : les originaux et les masques ne sont servis qu'à l'administrateur de la boutique. Les images publiques ne sont servies que sur le domaine de leur boutique.

## Installation

Il faut Node 20 ou plus récent, et PostgreSQL 14 ou plus récent.

```bash
cd plateforme
ONNXRUNTIME_NODE_INSTALL_CUDA=skip npm ci   # sans le téléchargement des pilotes GPU
cp .env.exemple .env                        # puis renseigner les adresses de la base
createdb portant
npm run migrer                              # crée les tables et le rôle portant_app
psql portant -c "alter role portant_app password 'un-mot-de-passe-solide'"
npm run boutique:creer -- --slug alba --nom "Alba Paris" --domaine alba.fr --domaine www.alba.fr \
  --email gerant@alba.fr --mdp "mot de passe de 10 caractères ou plus"
npm run build                               # construit les pages
npm start                                   # http://localhost:8787
```

En local, une boutique répond sur `http://<slug>.localhost:8787` (par exemple `http://alba.localhost:8787/admin/`).

## Mise en ligne

- **Serveur** : n'importe quel hébergeur Node avec un disque persistant (VPS, Railway, Render, Fly.io…). PostgreSQL managé (Neon, Supabase, Scaleway…).
- **Fichiers** : le dossier `stockage/` doit être sur un volume persistant et sauvegardé. Pour plusieurs serveurs, remplacer `serveur/stockage.js` par un stockage S3.
- **Domaines des boutiques** : le commerçant fait pointer son domaine (CNAME ou A) vers le serveur. Un proxy avec HTTPS automatique (Caddy, par exemple) délivre les certificats. Puis on ajoute le domaine : `insert into domaines (domaine, boutique_id) values ('alba.fr', '<id>')`.
- **Production** : `NODE_ENV=production`. Le paiement de test et l'adresse `?boutique=` sont alors désactivés.

## Mise en ligne sur Render

Le fichier `render.yaml` (à la racine du dépôt) décrit tout : service web (offre Standard, car le détourage utilise jusqu'à environ 550 Mo de mémoire), disque de 1 Go pour les photos, base PostgreSQL 16.
Render > **New** > **Blueprint** > choisir ce dépôt et la branche, puis **Apply**. Au premier démarrage :
- les migrations sont appliquées ;
- la boutique Ambre & Strass est créée et remplie par l'API d'administration (`DEMO_AMBRE=1`, environ 1 minute).

Le mot de passe de l'administration (`gerante@ambre-strass.fr`) est la variable `DEMO_MDP`, générée par Render.

La plateforme fonctionne aussi quand le compte de la base n'est pas super-utilisateur (cas de Render). L'application utilise alors le compte propriétaire, lui aussi soumis à l'isolation (FORCE ROW LEVEL SECURITY). Seules les tâches de fond (file de détourage, expiration des commandes) et la création de boutique ouvrent un accès global, le temps d'une transaction.

## Paiement (Stripe Connect)

1. Sur le compte Stripe de la plateforme : activer Connect, renseigner `STRIPE_SECRET_KEY` (et éventuellement `STRIPE_COMMISSION_POURCENT`).
2. Créer un webhook vers `https://<adresse-de-la-plateforme>/api/stripe/webhook`. Il doit écouter les événements des comptes connectés : `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`. Renseigner ensuite `STRIPE_WEBHOOK_SECRET`.
3. Chaque commerçant clique sur « Relier mon compte Stripe » dans Boutique > Paiement, termine l'inscription chez Stripe, puis choisit « Stripe ».

L'argent va directement sur le compte Stripe du commerçant. La plateforme peut prélever une commission. Au retour de Stripe, la commande est confirmée en interrogeant Stripe, sans attendre le webhook.

## Tests

```bash
npm start &                                          # boutiques alba et nova créées
node tests/api.js chemin/vers/photo.jpg              # API : détourage, variantes, isolation, achat, stock
node tests/parcours.e2e.js chemin/vers/photo.jpg     # navigateur : admin → détourage → portant → achat
node tests/creer-ambre.js                            # crée la boutique Ambre & Strass par l'API admin
node tests/ambre.e2e.js                              # vitrine : identité, accessoire, promo, achat au prix soldé
```

## Limites actuelles

- Le paiement Stripe est écrit mais n'a pas été essayé avec de vraies clés (testé ici avec le paiement simulé).
- Aucun e-mail n'est envoyé (ni confirmation au client, ni alerte de commande au commerçant).
- Un seul compte administrateur par boutique, créé en ligne de commande ; il n'y a pas d'espace « super-admin » pour créer les boutiques.
- Modèle de détourage : `modeles/silueta.onnx` (famille U²-Net, licence Apache 2.0), exécuté avec onnxruntime-node. Compter environ 1 seconde par photo.
