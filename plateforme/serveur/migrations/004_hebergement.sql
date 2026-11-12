-- Hébergement : la base peut n'avoir qu'un compte, propriétaire mais pas super-utilisateur.
-- L'isolation reste stricte (FORCE) ; seules les tâches de fond et l'outil de création de boutique
-- ouvrent explicitement, le temps d'une transaction, un accès à toutes les boutiques (app.taches = 'oui').

create or replace function acces_taches() returns boolean
language sql stable as $$ select coalesce(current_setting('app.taches', true), '') = 'oui' $$;

do $$
declare t text;
begin
  foreach t in array array['utilisateurs', 'sessions', 'collections', 'produits', 'produit_collections',
                           'couleurs', 'photos', 'variantes', 'commandes', 'lignes_commande'] loop
    execute format('drop policy if exists boutique_isolee on %I', t);
    execute format('create policy boutique_isolee on %I using (boutique_id = boutique_courante() or acces_taches()) with check (boutique_id = boutique_courante() or acces_taches())', t);
  end loop;
end $$;
drop policy if exists boutiques_taches on boutiques;
create policy boutiques_taches on boutiques for all using (acces_taches()) with check (acces_taches());
drop policy if exists domaines_taches on domaines;
create policy domaines_taches on domaines for all using (acces_taches()) with check (acces_taches());

create or replace function photo_suivante() returns table (id uuid, boutique_id uuid)
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.taches', 'oui', true);
  return query
    update photos p set statut = 'traitement', updated_at = now()
    where p.id = (select x.id from photos x where x.statut = 'en_attente' order by x.created_at limit 1 for update skip locked)
    returning p.id, p.boutique_id;
  perform set_config('app.taches', '', true);
end $$;

create or replace function photos_relancer() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  perform set_config('app.taches', 'oui', true);
  update photos set statut = 'en_attente' where statut = 'traitement';
  get diagnostics n = row_count;
  perform set_config('app.taches', '', true);
  return n;
end $$;

create or replace function expirer_commandes() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  perform set_config('app.taches', 'oui', true);
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
  perform set_config('app.taches', '', true);
  return n;
end $$;
