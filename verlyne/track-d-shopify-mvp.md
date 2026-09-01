# TRACK D — SHOPIFY & MVP

## Statut connexion

```
SHOPIFY BLOCKER = CONNECTION REQUIRED
```

Aucun connecteur Shopify n'est disponible dans cette session (`ListConnectors` ne retourne aucun résultat pour shopify/meta/analytics). Rien n'a été audité, modifié ni construit dans une boutique Shopify — je n'y ai aucun accès. Dès que Shopify est connecté, je fais l'audit en lecture seule (boutiques existantes, thèmes, produits) avant toute construction réversible.

## MVP — ce qui a pu avancer en attendant

- **ONE PRODUCT** : Collier personnalisé gravé — confirmé.
- **ONE MARKET** : France — confirmé.
- **ONE MAIN LANDING PAGE** : draft construit → `verlyne/product-page.html` (voir artifact publié). Mobile-first, 11 sections dans l'ordre demandé, zéro faux avis/urgence/stock/réduction, claims non vérifiés marqués `Placeholder`.
- **3 offres provisoires** : Solo 44,95€ / Gift 54,95€ / Premium 69,95€ — intégrées dans la page, marquées "prix provisoires" (ajustables post-devis fournisseur).

## Ce qui reste bloqué sans Shopify

- Mise en ligne réelle du thème/produit
- Checkout fonctionnel
- Pixel/CAPI (Track H)
- Variantes de prix réelles, gestion stock/personnalisation en back-office

## Prochaine étape dès connexion Shopify

1. Audit lecture seule (boutiques existantes, thèmes actifs, apps installées)
2. Identification d'un espace réversible (nouveau thème brouillon ou nouvelle boutique de développement — à confirmer avec toi, aucune suppression/remplacement)
3. Intégration du contenu déjà prêt (`product-page.html`) dans un thème Shopify
4. Configuration checkout + test d'achat
