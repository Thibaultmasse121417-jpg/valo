-- Vitrine complète : catégories, promotions, mise en avant, identité et textes de chaque boutique.

alter table produits
  add column categorie text not null default 'pulls-sweats',
  add column prix_promo_centimes integer check (prix_promo_centimes is null or prix_promo_centimes >= 0),
  add column mis_en_avant boolean not null default false;
alter table produits add constraint promo_inferieure check (prix_promo_centimes is null or prix_promo_centimes < prix_centimes);
create index on produits (boutique_id, categorie);

alter table collections add column description text not null default '';

-- Identité visuelle (couleurs, polices) et textes (bannière, annonces, présentation, contact…).
-- Le contenu exact est validé par le serveur ; voir serveur/vitrine.js.
alter table boutiques
  add column theme jsonb not null default '{}',
  add column contenus jsonb not null default '{}',
  add column banniere_chemin text,
  add column presentation_chemin text;

-- Ventes par produit (commandes payées et suivantes), pour « les plus aimés ».
create or replace view ventes_produits with (security_invoker = true) as
  select l.boutique_id, l.produit_id, sum(l.quantite)::int as ventes
  from lignes_commande l join commandes c on c.id = l.commande_id
  where c.statut in ('payee', 'preparee', 'expediee', 'retiree') and l.produit_id is not null
  group by l.boutique_id, l.produit_id;
do $$ begin if exists (select 1 from pg_roles where rolname = 'portant_app') then grant select on ventes_produits to portant_app; end if; end $$;
