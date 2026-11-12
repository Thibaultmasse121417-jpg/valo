-- Tâches de fond qui traversent les boutiques, limitées à ce dont elles ont besoin.
-- Elles s'exécutent avec les droits du propriétaire (security definer) mais ne renvoient
-- que des identifiants : le travail lui-même se fait ensuite boutique par boutique.

do $$ begin if exists (select 1 from pg_roles where rolname = 'portant_app') then revoke all on _migrations from portant_app; end if; end $$;

-- Réserve la prochaine photo à détourer (une seule à la fois par appel, sans conflit).
create or replace function photo_suivante() returns table (id uuid, boutique_id uuid)
language sql security definer set search_path = public as $$
  update photos p set statut = 'traitement', updated_at = now()
  where p.id = (select x.id from photos x where x.statut = 'en_attente' order by x.created_at limit 1 for update skip locked)
  returning p.id, p.boutique_id
$$;

-- Au démarrage : les photos restées « en traitement » (serveur arrêté) repartent en file.
create or replace function photos_relancer() returns integer
language sql security definer set search_path = public as $$
  with r as (update photos set statut = 'en_attente' where statut = 'traitement' returning 1) select count(*)::int from r
$$;

-- Commandes non payées à temps : le stock réservé est rendu.
create or replace function expirer_commandes() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  with exp as (
    update commandes set statut = 'expiree'
    where statut = 'en_attente_paiement' and expire_at < now()
    returning id
  ), rendu as (
    update variantes v set stock = v.stock + l.q
    from (select variante_id, sum(quantite) q from lignes_commande where commande_id in (select id from exp) and variante_id is not null group by variante_id) l
    where v.id = l.variante_id
    returning 1
  )
  select count(*) into n from exp;
  return n;
end $$;

revoke all on function photo_suivante(), photos_relancer(), expirer_commandes() from public;
do $$ begin if exists (select 1 from pg_roles where rolname = 'portant_app') then grant execute on function photo_suivante(), photos_relancer(), expirer_commandes() to portant_app; end if; end $$;
