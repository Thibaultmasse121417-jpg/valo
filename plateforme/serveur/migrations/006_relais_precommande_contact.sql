-- Point relais, précommandes et messages du formulaire de contact.

alter table commandes drop constraint if exists commandes_livraison_mode_check;
alter table commandes add constraint commandes_livraison_mode_check check (livraison_mode in ('livraison', 'retrait', 'relais'));

-- Prix de la livraison en point relais (null = pas de point relais proposé).
alter table boutiques add column relais_centimes integer check (relais_centimes >= 0);

-- Précommande : date d'expédition prévue (null = article disponible tout de suite).
alter table produits add column expedition_prevue date;

create table messages (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  nom text not null default '',
  email text not null,
  telephone text not null default '',
  message text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);
create index on messages (boutique_id, created_at desc);
alter table messages enable row level security;
alter table messages force row level security;
create policy boutique_isolee on messages
  using (boutique_id = boutique_courante() or acces_taches())
  with check (boutique_id = boutique_courante() or acces_taches());
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'portant_app') then
    grant select, insert, update, delete on messages to portant_app;
  end if;
end $$;
