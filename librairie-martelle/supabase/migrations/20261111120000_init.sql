-- =====================================================================
-- Librairie Martelle — schéma initial
-- Catalogue (livres), rayons (12 catégories du carrousel), sélections,
-- événements, informations pratiques, imports CSV et synchronisation
-- avec le logiciel de gestion de stock.
--
-- Sécurité : Row Level Security sur toutes les tables.
--   * lecture publique (anon) limitée aux contenus publiés ;
--   * écriture réservée aux comptes déclarés dans public.staff.
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
create type public.availability as enum ('in_stock', 'low_stock', 'on_order', 'preorder', 'out_of_stock');
create type public.event_kind   as enum ('dedicace', 'rencontre', 'lecture', 'atelier', 'jeu', 'autre');
create type public.book_source  as enum ('manual', 'isbn', 'csv', 'sync');

-- ---------------------------------------------------------------------
-- Équipe (comptes autorisés à administrer le site)
-- ---------------------------------------------------------------------
create table public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role         text not null default 'editor' check (role in ('owner', 'editor')),
  created_at   timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- À utiliser depuis l'éditeur SQL de Supabase uniquement (non exposé à l'API).
create or replace function public.grant_staff(p_email text, p_name text default null, p_role text default 'editor')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    raise exception 'Aucun utilisateur avec l''adresse %. Créez-le d''abord dans Authentication > Users.', p_email;
  end if;
  insert into public.staff (user_id, display_name, role)
  values (v_id, coalesce(p_name, p_email), p_role)
  on conflict (user_id) do update set display_name = excluded.display_name, role = excluded.role;
  return v_id;
end;
$$;
revoke execute on function public.grant_staff(text, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Horodatage + traçabilité
-- ---------------------------------------------------------------------
create or replace function public.touch_row()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Rayons : les 12 livres du carrousel 3D
-- ---------------------------------------------------------------------
create table public.categories (
  id            text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  position      smallint not null unique,
  title         text not null check (char_length(title) between 1 and 60),
  short_title   text not null check (char_length(short_title) between 1 and 20),
  kicker        text check (char_length(kicker) <= 60),
  description   text check (char_length(description) <= 600),
  location_hint text check (char_length(location_hint) <= 160),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users (id) on delete set null
);
create trigger categories_touch before update on public.categories for each row execute function public.touch_row();

insert into public.categories (id, position, title, short_title, kicker, description, location_hint) values
  ('litterature', 1,  'Littérature & Essais', 'Littérature', 'Romans · Essais littéraires', 'Romans français et étrangers, essais littéraires, premiers romans et grandes voix : la littérature est le cœur battant d’une librairie.', 'dès l’entrée de la librairie.'),
  ('polar',       2,  'Policier & Thriller', 'Polar', 'Enquêtes · Suspense', 'Enquêtes, romans noirs et thrillers psychologiques, pour les lecteurs qui aiment tourner les pages jusqu’au bout de la nuit.', 'le rayon policier, dans les allées.'),
  ('imaginaire',  3,  'Imaginaire', 'Imaginaire', 'SF · Fantastique · Fantasy', 'Science-fiction, fantastique et fantasy : des mondes à explorer, des sagas à commencer et des classiques à redécouvrir.', 'science-fiction et fantasy, au sous-sol.'),
  ('bd',          4,  'BD, Comics & Manga', 'BD & Manga', 'Bande dessinée · Comics · Manga', 'Albums franco-belges, romans graphiques, comics et mangas : toutes les façons de raconter une histoire en cases.', 'BD et mangas, au sous-sol.'),
  ('jeunesse',    5,  'Jeunesse', 'Jeunesse', 'Des tout-petits aux ados', 'Des premiers imagiers aux romans pour les plus grands : de quoi éveiller très tôt le goût de lire.', 'l’espace jeunesse, des tout-petits aux adolescents.'),
  ('poche',       6,  'Poche', 'Poche', 'La pochothèque', 'Les classiques, les grands succès et les découvertes, au format qui tient dans la poche.', 'le rayon poche, ou « pochothèque ».'),
  ('arts',        7,  'Arts & Beaux livres', 'Beaux livres', 'Arts · Beaux livres', 'Peinture, photographie, architecture, design : de grands formats à feuilleter et à offrir.', 'l’espace beaux-arts, dans les allées.'),
  ('actualites',  8,  'Actualités & Savoirs', 'Actualités', 'Actualités · Universitaire', 'Histoire, philosophie, essais d’actualité et ouvrages universitaires : des livres pour comprendre le monde et en débattre.', 'les rayons actualités et universitaire.'),
  ('voyages',     9,  'Tourisme & Voyages', 'Voyages', 'Guides · Récits de voyage', 'Guides, cartes et récits de voyage, pour préparer le prochain départ ou voyager sans quitter son fauteuil.', 'le coin tourisme, dans les allées.'),
  ('scolaire',    10, 'Scolaire', 'Scolaire', 'Le métier d’origine, depuis 1957', 'Manuels, cahiers et ouvrages parascolaires : les livres scolaires sont le premier métier de la librairie, depuis son ouverture.', 'le rayon scolaire, premier métier de la maison.'),
  ('beauxarts',   11, 'Beaux-arts & Créatif', 'Color’i', 'Beaux-arts · Loisirs créatifs', 'Matériel de beaux-arts, loisirs créatifs, éveil artistique et encadrement : de quoi dessiner, peindre et créer.', 'à l’étage, avec l’enseigne Color’i.'),
  ('jeux',        12, 'Jeux & Jouets', 'Jeux', 'Jeux de société · Jeux éducatifs', 'Jeux de société pour toute la famille, jeux éducatifs et jouets : le plaisir de jouer, autour d’une table comme d’un livre.', 'jeux de société et jeux éducatifs.');

-- ---------------------------------------------------------------------
-- Livres (catalogue)
-- ---------------------------------------------------------------------
create table public.books (
  id               uuid primary key default gen_random_uuid(),
  isbn             text unique check (isbn ~ '^97[89][0-9]{10}$'),          -- ISBN-13 normalisé (chiffres)
  title            text not null check (char_length(title) between 1 and 300),
  subtitle         text check (char_length(subtitle) <= 300),
  authors          text[] not null default '{}',
  authors_text     text not null default '',                                -- maintenu par trigger (recherche)
  publisher        text check (char_length(publisher) <= 200),
  published_date   text check (published_date ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'),
  page_count       integer check (page_count between 1 and 20000),
  language         text check (char_length(language) <= 10),
  description      text check (char_length(description) <= 8000),
  cover_path       text,                                                     -- fichier dans le bucket « media »
  cover_url        text check (cover_url ~ '^https://'),                     -- couverture externe autorisée
  cover_credit     text check (char_length(cover_credit) <= 120),
  price            numeric(8, 2) check (price >= 0 and price < 100000),
  availability     public.availability not null default 'in_stock',
  stock_qty        integer check (stock_qty >= 0),
  category_id      text references public.categories (id) on update cascade on delete set null,
  is_new           boolean not null default false,
  is_bestseller    boolean not null default false,
  is_staff_pick    boolean not null default false,
  new_rank         integer not null default 0,
  bestseller_rank  integer not null default 0,
  pick_rank        integer not null default 0,
  staff_note       text check (char_length(staff_note) <= 1200),
  staff_name       text check (char_length(staff_name) <= 80),
  published        boolean not null default true,
  source           public.book_source not null default 'manual',
  metadata_source  text check (char_length(metadata_source) <= 120),
  external_ref     text check (char_length(external_ref) <= 120),            -- identifiant dans le logiciel de stock
  stock_synced_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by       uuid references auth.users (id) on delete set null
);

create or replace function public.books_before_write()
returns trigger
language plpgsql
as $$
begin
  new.authors := coalesce(array(select btrim(a) from unnest(new.authors) a where btrim(a) <> ''), '{}');
  new.authors_text := array_to_string(new.authors, ', ');
  new.title := btrim(new.title);
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    if auth.uid() is not null then new.updated_by := auth.uid(); end if;
    -- entrée dans une sélection : placée en tête
    if new.is_new and not old.is_new and new.new_rank = old.new_rank then new.new_rank := 0; end if;
  end if;
  return new;
end;
$$;
create trigger books_before_write before insert or update on public.books for each row execute function public.books_before_write();

create index books_category_idx     on public.books (category_id, published, created_at desc);
create index books_new_idx          on public.books (new_rank, created_at desc) where is_new and published;
create index books_bestseller_idx   on public.books (bestseller_rank) where is_bestseller and published;
create index books_pick_idx         on public.books (pick_rank) where is_staff_pick and published;
create index books_title_trgm       on public.books using gin (title extensions.gin_trgm_ops);
create index books_authors_trgm     on public.books using gin (authors_text extensions.gin_trgm_ops);
create index books_external_ref_idx on public.books (external_ref) where external_ref is not null;

-- ---------------------------------------------------------------------
-- Événements & rencontres
-- ---------------------------------------------------------------------
create table public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  kind             public.event_kind not null default 'rencontre',
  starts_at        timestamptz not null,
  ends_at          timestamptz check (ends_at is null or ends_at >= starts_at),
  location         text not null default 'Librairie Martelle, 3 rue des Vergeaux, Amiens' check (char_length(location) <= 200),
  guests           text check (char_length(guests) <= 300),
  description      text check (char_length(description) <= 4000),
  book_id          uuid references public.books (id) on delete set null,
  image_path       text,
  booking_url      text check (booking_url ~ '^(https://|mailto:|tel:)'),
  booking_required boolean not null default false,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null
);
create trigger events_touch before update on public.events for each row execute function public.touch_row();
create index events_upcoming_idx on public.events (starts_at) where published;

-- ---------------------------------------------------------------------
-- Informations pratiques (une seule ligne)
-- ---------------------------------------------------------------------
create table public.shop_settings (
  id                 smallint primary key default 1 check (id = 1),
  -- 7 entrées, lundi → dimanche : {"open":"09:30","close":"19:00"} ou null si fermé
  opening_hours      jsonb not null,
  -- [{"date":"2026-11-11","label":"Jour férié"}]
  closures           jsonb not null default '[]'::jsonb,
  phone              text not null default '03 22 71 54 54',
  email              text not null default 'commandes@librairiemartelle.com',
  address            text not null default '3 rue des Vergeaux, 80000 Amiens',
  order_url          text check (order_url ~ '^https://'),                 -- boutique en ligne générale
  book_url_template  text check (book_url_template ~ '^https://.*\{isbn\}'),-- fiche livre en ligne, ex. https://…/{isbn}
  announcement       text check (char_length(announcement) <= 240),        -- bandeau d'information
  updated_at         timestamptz not null default now(),
  updated_by         uuid references auth.users (id) on delete set null,
  constraint opening_hours_shape check (jsonb_typeof(opening_hours) = 'array' and jsonb_array_length(opening_hours) = 7),
  constraint closures_shape check (jsonb_typeof(closures) = 'array')
);
create trigger shop_settings_touch before update on public.shop_settings for each row execute function public.touch_row();

-- Valeurs relevées sur la fiche leslibraires.fr de la librairie (11/11/2026)
insert into public.shop_settings (id, opening_hours, closures, order_url) values (
  1,
  '[{"open":"09:30","close":"19:00"},{"open":"09:30","close":"19:00"},{"open":"09:30","close":"19:00"},{"open":"09:30","close":"19:00"},{"open":"09:30","close":"19:00"},{"open":"09:30","close":"19:00"},null]',
  '[{"date":"2026-11-11","label":"Fermeture exceptionnelle"}]',
  'https://www.leslibraires.fr/presentation/librairie-martelle/'
);

-- ---------------------------------------------------------------------
-- Journal des imports CSV et des synchronisations
-- ---------------------------------------------------------------------
create table public.import_jobs (
  id          uuid primary key default gen_random_uuid(),
  filename    text,
  total       integer not null default 0,
  inserted    integer not null default 0,
  updated     integer not null default 0,
  failed      integer not null default 0,
  errors      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid() references auth.users (id) on delete set null
);

create table public.sync_runs (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,
  received    integer not null default 0,
  updated     integer not null default 0,
  created     integer not null default 0,
  unknown     integer not null default 0,
  errors      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Fonctions publiques
-- ---------------------------------------------------------------------
create or replace function public.category_counts()
returns table (category_id text, books bigint)
language sql
stable
as $$
  select b.category_id, count(*) from public.books b where b.published and b.category_id is not null group by b.category_id;
$$;

-- Ordre d'une sélection (nouveautés, meilleures ventes, coups de cœur) en un seul appel
create or replace function public.reorder_selection(p_kind text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  if p_kind = 'new' then
    update public.books b set new_rank = x.ord from unnest(p_ids) with ordinality as x(id, ord) where b.id = x.id;
  elsif p_kind = 'best' then
    update public.books b set bestseller_rank = x.ord from unnest(p_ids) with ordinality as x(id, ord) where b.id = x.id;
  elsif p_kind = 'picks' then
    update public.books b set pick_rank = x.ord from unnest(p_ids) with ordinality as x(id, ord) where b.id = x.id;
  else
    raise exception 'Sélection inconnue : %', p_kind;
  end if;
end;
$$;
revoke execute on function public.reorder_selection(text, uuid[]) from anon;

-- Tableau de bord de l'administration
create or replace function public.admin_stats()
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'books',        (select count(*) from public.books),
    'published',    (select count(*) from public.books where published),
    'drafts',       (select count(*) from public.books where not published),
    'out_of_stock', (select count(*) from public.books where availability = 'out_of_stock'),
    'no_category',  (select count(*) from public.books where category_id is null),
    'no_price',     (select count(*) from public.books where price is null),
    'is_new',       (select count(*) from public.books where is_new),
    'bestsellers',  (select count(*) from public.books where is_bestseller),
    'picks',        (select count(*) from public.books where is_staff_pick),
    'upcoming',     (select count(*) from public.events where starts_at >= now()),
    'last_sync',    (select max(created_at) from public.sync_runs)
  )
  where public.is_staff();
$$;

-- ---------------------------------------------------------------------
-- Synchronisation avec le logiciel de gestion de stock
-- Appelée uniquement par l'Edge Function « pos-sync » (clé service_role).
-- Met à jour prix / quantité / disponibilité, jamais les textes ni les sélections.
-- ---------------------------------------------------------------------
create or replace function public.apply_stock_sync(p_source text, p_items jsonb, p_create_missing boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int := 0;
  v_created int := 0;
  v_unknown int := 0;
  v_errors  jsonb := '[]'::jsonb;
  v_total   int := jsonb_array_length(p_items);
begin
  create temp table _sync_in on commit drop as
  select
    t.ord::int as ord,
    case when (t.e->>'isbn') ~ '^97[89][0-9]{10}$' then t.e->>'isbn' end as isbn,
    nullif(btrim(t.e->>'external_ref'), '') as external_ref,
    case when jsonb_typeof(t.e->'price') = 'number' and (t.e->>'price')::numeric between 0 and 99999 then round((t.e->>'price')::numeric, 2) end as price,
    case when jsonb_typeof(t.e->'stock_qty') = 'number' then greatest(0, floor((t.e->>'stock_qty')::numeric))::int end as stock_qty,
    case when t.e->>'availability' in ('in_stock', 'low_stock', 'on_order', 'preorder', 'out_of_stock') then (t.e->>'availability')::public.availability end as availability,
    nullif(btrim(t.e->>'title'), '') as title
  from jsonb_array_elements(p_items) with ordinality as t(e, ord);

  -- lignes inutilisables
  select coalesce(jsonb_agg(jsonb_build_object('index', ord, 'error', 'isbn ou external_ref manquant ou invalide')), '[]'::jsonb)
    into v_errors from _sync_in where isbn is null and external_ref is null;

  create temp table _sync_match on commit drop as
  select distinct on (b.id) b.id as book_id, i.*
  from _sync_in i
  join public.books b on (i.isbn is not null and b.isbn = i.isbn) or (i.isbn is null and i.external_ref is not null and b.external_ref = i.external_ref)
  order by b.id, i.ord desc;

  update public.books b set
    price        = coalesce(m.price, b.price),
    stock_qty    = coalesce(m.stock_qty, b.stock_qty),
    availability = coalesce(m.availability,
                     case when m.stock_qty is null then b.availability
                          when m.stock_qty = 0 then case when b.availability in ('on_order', 'preorder') then b.availability else 'out_of_stock'::public.availability end
                          when m.stock_qty <= 2 then 'low_stock'::public.availability
                          else 'in_stock'::public.availability end),
    external_ref = coalesce(b.external_ref, m.external_ref),
    stock_synced_at = now()
  from _sync_match m
  where b.id = m.book_id;
  get diagnostics v_updated = row_count;

  select count(*) into v_unknown
  from _sync_in i
  where (i.isbn is not null or i.external_ref is not null)
    and not exists (select 1 from _sync_match m where m.ord = i.ord)
    and not exists (select 1 from public.books b where (i.isbn is not null and b.isbn = i.isbn) or (i.isbn is null and b.external_ref = i.external_ref));

  if p_create_missing then
    insert into public.books (isbn, title, price, stock_qty, availability, external_ref, published, source, stock_synced_at)
    select distinct on (i.isbn) i.isbn, coalesce(i.title, 'À compléter — ISBN ' || i.isbn), i.price, i.stock_qty,
           coalesce(i.availability, case when i.stock_qty = 0 then 'out_of_stock'::public.availability when i.stock_qty <= 2 then 'low_stock'::public.availability else 'in_stock'::public.availability end),
           i.external_ref, false, 'sync', now()
    from _sync_in i
    where i.isbn is not null and not exists (select 1 from public.books b where b.isbn = i.isbn)
    order by i.isbn, i.ord desc
    on conflict (isbn) do nothing;
    get diagnostics v_created = row_count;
    v_unknown := greatest(0, v_unknown - v_created);
  end if;

  insert into public.sync_runs (source, received, updated, created, unknown, errors)
  values (left(coalesce(p_source, 'inconnu'), 80), v_total, v_updated, v_created, v_unknown, v_errors);

  return jsonb_build_object('received', v_total, 'updated', v_updated, 'created', v_created, 'unknown', v_unknown, 'errors', v_errors);
end;
$$;
revoke execute on function public.apply_stock_sync(text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.apply_stock_sync(text, jsonb, boolean) to service_role;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.staff         enable row level security;
alter table public.categories    enable row level security;
alter table public.books         enable row level security;
alter table public.events        enable row level security;
alter table public.shop_settings enable row level security;
alter table public.import_jobs   enable row level security;
alter table public.sync_runs     enable row level security;

create policy "staff: voir son équipe" on public.staff for select to authenticated using (public.is_staff());

create policy "categories: lecture publique" on public.categories for select to anon, authenticated using (true);
create policy "categories: modification équipe" on public.categories for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "books: lecture des livres publiés" on public.books for select to anon, authenticated using (published or public.is_staff());
create policy "books: ajout équipe" on public.books for insert to authenticated with check (public.is_staff());
create policy "books: modification équipe" on public.books for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "books: suppression équipe" on public.books for delete to authenticated using (public.is_staff());

create policy "events: lecture des événements publiés" on public.events for select to anon, authenticated using (published or public.is_staff());
create policy "events: ajout équipe" on public.events for insert to authenticated with check (public.is_staff());
create policy "events: modification équipe" on public.events for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "events: suppression équipe" on public.events for delete to authenticated using (public.is_staff());

create policy "settings: lecture publique" on public.shop_settings for select to anon, authenticated using (true);
create policy "settings: modification équipe" on public.shop_settings for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "imports: équipe" on public.import_jobs for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "sync: lecture équipe" on public.sync_runs for select to authenticated using (public.is_staff());

-- Colonnes visibles du public : pas de traçabilité interne ni de référence du logiciel de stock.
revoke all on public.books from anon;
grant select (id, isbn, title, subtitle, authors, authors_text, publisher, published_date, page_count, language, description,
              cover_path, cover_url, cover_credit, price, availability, category_id, is_new, is_bestseller, is_staff_pick,
              new_rank, bestseller_rank, pick_rank, staff_note, staff_name, published, created_at, updated_at)
  on public.books to anon;
revoke all on public.events, public.categories, public.shop_settings from anon;
grant select on public.events, public.categories to anon;
grant select (opening_hours, closures, phone, email, address, order_url, book_url_template, announcement, updated_at) on public.shop_settings to anon;
revoke all on public.staff, public.import_jobs, public.sync_runs from anon;
revoke execute on function public.admin_stats() from anon;
revoke execute on function public.reorder_selection(text, uuid[]) from public;
grant execute on function public.reorder_selection(text, uuid[]) to authenticated;

-- ---------------------------------------------------------------------
-- Stockage des images (couvertures, visuels d'événements)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "media: lecture publique" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media: ajout équipe" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
create policy "media: modification équipe" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_staff());
create policy "media: suppression équipe" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_staff());
