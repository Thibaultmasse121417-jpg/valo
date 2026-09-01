# TRACK G — META (préparation uniquement, aucune pub active, aucun budget dépensé)

Market = France. Structure préparée à l'avance pour être activée dès que Shopify + Meta + tracking seront accessibles.

## Vérification des pratiques actuelles (recherche faite, sept. 2026)

Sources consultées : guides Meta Ads 2026 (Advantage+/Andromeda) — voir liens en fin de fichier.

Points clés retenus, applicables à un compte neuf sans historique :
- Meta a fusionné les flux "manuel" et "Advantage+" — l'IA est le défaut sur toute nouvelle campagne.
- Activer Advantage+ sans historique de conversions prive l'IA de données d'entraînement : recommandation générale = accumuler des signaux de conversion (ordre de grandeur ~50 événements) via une phase manuelle/creative-first avant de laisser l'optimisation IA piloter à pleine échelle.
- Le CAPI + Pixel avec déduplication propre (event_id, event_name identiques des deux côtés) est le prérequis avant tout scaling — une donnée bruitée dégrade l'IA plutôt que de l'aider.
- Format de test créatif recommandé en 2026 : 1 campagne, 1-2 ad sets, 8-15 créatives en simultané dans le même ad set, l'algorithme répartissant les impressions selon ce qui accroche réellement (plutôt qu'un split fixe type 70/30 proven/test).

## Recommandation pour Verlyne (nouveau produit, nouveau pixel, nouveau compte)

**Ne pas partir directement en pur Advantage+ Sales**, malgré le discours marketing dominant — le compte n'a ni pixel mature ni historique de conversions. Structure recommandée :

1. **Phase 1 — Creative-first testing manuel** (avant tout scaling) : 1 campagne CBO, 1-2 ad sets, ciblage large France, les 8 créatives Wave 1 chargées ensemble dans le(s) même(s) ad set(s). Objectif : générer un premier volume de signal propre (ViewContent → Purchase) et identifier les 2-3 créatives qui accrochent réellement.
2. **Phase 2 — une fois ~50 conversions accumulées** : introduire une campagne Advantage+ Sales en parallèle avec 20-30% du budget test, garder la campagne manuelle active pour comparer.
3. Rafraîchir le pipeline créatif toutes les 2-4 semaines une fois en régime de test (nouvelles variantes, pas juste couleur/headline — cohérent avec Track F).

Ce choix sera reconfirmé au moment de l'activation réelle (les pratiques Meta évoluent vite) — cette recommandation n'est pas figée tant qu'aucune campagne n'est réellement créée.

## Statut

```
META CAMPAIGN = DRAFT (structure seulement, rien créé dans l'ads manager)
BUDGET DÉPENSÉ = 0€
```

## Sources
- https://medium.com/@tentenco/how-to-build-a-successful-campaign-with-metas-advantage-ai-the-complete-2026-playbook-befca729202b
- https://pixelflow.so/blog/meta-ads-checklist-2026
- https://affectgroup.com/blog/how-to-test-creatives-in-meta-ads-in-2026-a-working-system-in-the-era-of-advantage-and-andromeda/
- https://www.1clickreport.com/blog/meta-advantage-plus-campaign-setup-2026
