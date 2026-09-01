# TRACK H — TRACKING

Statut : **BLOQUÉ** — aucune boutique Shopify ni compte Meta/GA4 accessible dans cette session (`ListConnectors` vide). Rien ne peut être vérifié tant que ces accès ne sont pas connectés.

## Checklist prête à exécuter dès accès disponible

```
PIXEL          = À VÉRIFIER
CAPI           = À VÉRIFIER
GA4            = À VÉRIFIER
PURCHASE TEST  = À VÉRIFIER
```

À contrôler pour chaque événement (ViewContent, AddToCart, InitiateCheckout, Purchase) :
- `value` correct et non nul
- `currency` = EUR
- `event_id` identique entre Pixel (navigateur) et CAPI (serveur) pour permettre la déduplication
- déduplication effective (pas de double comptage Pixel+CAPI dans Events Manager)
- UTM présents et cohérents sur les liens publicitaires (source/medium/campaign/content)
- Achat test réel effectué de bout en bout (commande passée → Purchase remonté avec le bon montant côté Pixel, CAPI et GA4)

Aucune publicité ne sera activée avant que les 4 lignes ci-dessus passent PASS.
