-- Plateforme « portant » : une base pour toutes les boutiques, données isolées par boutique.
-- Chaque table métier porte boutique_id. L'application se connecte avec le rôle portant_app,
-- soumis à la sécurité au niveau des lignes (RLS) : une requête ne voit que la boutique
-- déclarée dans la transaction (set_config('app.boutique_id', …)).

create extension if not exists pgcrypto;

create or replace function boutique_courante() returns uuid
language sql stable as $$ select nullif(current_setting('app.boutique_id', true), '')::uuid $$;

create table boutiques (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  nom text not null,
  slogan text not null default '',
  logo_chemin text,
  couleurs jsonb not null default '{"accent":"#e2481d","fond":"#f3f1ec","texte":"#151515"}',
  devise text not null default 'EUR',
  livraison_centimes integer not null default 490 check (livraison_centimes >= 0),
  livraison_offerte_centimes integer not null default 12000 check (livraison_offerte_centimes >= 0),
  retrait_adresse text not null default '',
  paiement_mode text not null default 'test' check (paiement_mode in ('test', 'stripe')),
  stripe_compte text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table domaines (
  domaine text primary key check (domaine = lower(domaine)),
  boutique_id uuid not null references boutiques (id) on delete cascade
);

create table utilisateurs (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  email text not null check (email = lower(email)),
  mot_de_passe text not null,
  nom text not null default '',
  created_at timestamptz not null default now(),
  unique (boutique_id, email)
);

create table sessions (
  jeton_hash text primary key,
  boutique_id uuid not null references boutiques (id) on delete cascade,
  utilisateur_id uuid not null references utilisateurs (id) on delete cascade,
  expire_at timestamptz not null
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  nom text not null,
  ordre integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table produits (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  reference text not null,
  nom text not null,
  type text not null default '',
  description text not null default '',
  prix_centimes integer not null check (prix_centimes >= 0),
  tailles text[] not null default array['S', 'M', 'L'],
  visible boolean not null default true,
  nouveau boolean not null default false,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (boutique_id, reference)
);

create table produit_collections (
  boutique_id uuid not null references boutiques (id) on delete cascade,
  produit_id uuid not null references produits (id) on delete cascade,
  collection_id uuid not null references collections (id) on delete cascade,
  primary key (produit_id, collection_id)
);

create table couleurs (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  produit_id uuid not null references produits (id) on delete cascade,
  nom text not null,
  hex text not null default '#888888' check (hex ~ '^#[0-9a-fA-F]{6}$'),
  ordre integer not null default 0
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  produit_id uuid not null references produits (id) on delete cascade,
  couleur_id uuid references couleurs (id) on delete set null,
  role text not null default 'face' check (role in ('face', 'dos', 'detail')),
  ordre integer not null default 0,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'traitement', 'pret', 'erreur')),
  erreur text,
  original_chemin text not null,
  masque_chemin text,
  portant_chemin text,
  vignette_chemin text,
  reglages jsonb not null default '{"cintre":"auto","echelle":1,"dx":0,"dy":0}',
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table variantes (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  produit_id uuid not null references produits (id) on delete cascade,
  couleur_id uuid not null references couleurs (id) on delete cascade,
  taille text not null,
  sku text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (couleur_id, taille),
  unique (boutique_id, sku)
);

create sequence commandes_numero;
create table commandes (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  numero bigint not null default nextval('commandes_numero'),
  jeton text not null unique default encode(gen_random_bytes(18), 'hex'),
  statut text not null default 'en_attente_paiement'
    check (statut in ('en_attente_paiement', 'payee', 'preparee', 'expediee', 'retiree', 'annulee', 'expiree')),
  client jsonb not null,
  livraison_mode text not null check (livraison_mode in ('livraison', 'retrait')),
  sous_total_centimes integer not null,
  livraison_centimes integer not null,
  total_centimes integer not null,
  paiement_mode text not null,
  paiement_ref text,
  expire_at timestamptz not null default now() + interval '30 minutes',
  payee_at timestamptz,
  created_at timestamptz not null default now()
);

create table lignes_commande (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  commande_id uuid not null references commandes (id) on delete cascade,
  variante_id uuid references variantes (id) on delete set null,
  produit_id uuid references produits (id) on delete set null,
  nom text not null,
  couleur text not null,
  taille text not null,
  sku text not null,
  prix_unitaire_centimes integer not null,
  quantite integer not null check (quantite > 0)
);

create index on produits (boutique_id, ordre);
create index on photos (produit_id, ordre);
create index on photos (statut) where statut in ('en_attente', 'traitement');
create index on variantes (produit_id);
create index on commandes (boutique_id, created_at desc);
create index on lignes_commande (commande_id);

-- Isolation par boutique ----------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['utilisateurs', 'sessions', 'collections', 'produits', 'produit_collections',
                           'couleurs', 'photos', 'variantes', 'commandes', 'lignes_commande'] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format('create policy boutique_isolee on %I using (boutique_id = boutique_courante()) with check (boutique_id = boutique_courante())', t);
  end loop;
end $$;

-- Les fiches boutiques et domaines sont publiques en lecture (nom, couleurs, logo) ;
-- une boutique ne modifie que la sienne.
alter table boutiques enable row level security;
alter table boutiques force row level security;
create policy boutiques_lecture on boutiques for select using (true);
create policy boutiques_maj on boutiques for update using (id = boutique_courante()) with check (id = boutique_courante());
alter table domaines enable row level security;
alter table domaines force row level security;
create policy domaines_lecture on domaines for select using (true);

-- Rôle de l'application : aucun contournement de la sécurité par ligne.
-- Sur une base hébergée (Render, Neon…) le compte n'a souvent pas le droit de créer un rôle :
-- l'application utilise alors le compte propriétaire, lui aussi soumis à l'isolation (FORCE).
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'portant_app') then
    create role portant_app login nosuperuser nobypassrls; -- mot de passe : alter role portant_app password '…'
  end if;
  grant usage on schema public to portant_app;
  grant select, insert, update, delete on all tables in schema public to portant_app;
  grant usage, select on all sequences in schema public to portant_app;
  revoke insert, delete on boutiques, domaines from portant_app;
exception when insufficient_privilege then
  raise notice 'Rôle portant_app non créé (droits insuffisants) : l''application utilisera le compte propriétaire.';
end $$;
