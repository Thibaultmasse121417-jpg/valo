-- =====================================================================
-- v3 : catalogue (genre, archivage, recherche sans accents, disponibilité
-- facultative), événements annulables, contenus éditables, photos.
-- =====================================================================

-- ---------- recherche insensible aux accents ----------
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- ---------- livres ----------
alter table public.books
  add column genre        text check (char_length(genre) <= 80),
  add column archived_at  timestamptz,
  add column search_text  text not null default '';

-- La disponibilité n'est affichée que si elle a été renseignée (libraire ou logiciel de stock).
alter table public.books alter column availability drop not null;
alter table public.books alter column availability drop default;

create or replace function public.books_before_write()
returns trigger
language plpgsql
as $$
begin
  new.authors := coalesce(array(select btrim(a) from unnest(new.authors) a where btrim(a) <> ''), '{}');
  new.authors_text := array_to_string(new.authors, ', ');
  new.title := btrim(new.title);
  new.search_text := lower(public.f_unaccent(concat_ws(' ', new.title, new.subtitle, new.authors_text, new.publisher, new.genre, new.isbn)));
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    if auth.uid() is not null then new.updated_by := auth.uid(); end if;
    if new.is_new and not old.is_new and new.new_rank = old.new_rank then new.new_rank := 0; end if;
  end if;
  return new;
end;
$$;
update public.books set title = title;  -- remplit search_text

create index books_search_trgm on public.books using gin (search_text extensions.gin_trgm_ops);
create index books_public_idx on public.books (published, archived_at, category_id);

drop policy "books: lecture des livres publiés" on public.books;
create policy "books: lecture des livres publiés" on public.books for select to anon, authenticated
  using ((published and archived_at is null) or public.is_staff());

grant select (genre, search_text, archived_at) on public.books to anon;

create or replace function public.category_counts()
returns table (category_id text, books bigint)
language sql
stable
as $$
  select b.category_id, count(*) from public.books b
  where b.published and b.archived_at is null and b.category_id is not null
  group by b.category_id;
$$;

-- ---------- événements ----------
alter table public.events
  add column cancelled   boolean not null default false,
  add column cancel_note text check (char_length(cancel_note) <= 300);

-- ---------- contenus éditables (textes, accueil, pages légales) ----------
create table public.site_content (
  key        text primary key check (key ~ '^[a-z0-9_.]{2,60}$'),
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger site_content_touch before update on public.site_content for each row execute function public.touch_row();
alter table public.site_content enable row level security;
create policy "contenus: lecture publique" on public.site_content for select to anon, authenticated using (true);
create policy "contenus: ajout équipe" on public.site_content for insert to authenticated with check (public.is_staff());
create policy "contenus: modification équipe" on public.site_content for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "contenus: suppression équipe" on public.site_content for delete to authenticated using (public.is_staff());
revoke all on public.site_content from anon;
grant select (key, value, updated_at) on public.site_content to anon;

-- Tant que la librairie n'a pas validé son catalogue, un bandeau le signale comme démonstration.
insert into public.site_content (key, value) values ('site.demo_catalogue', 'true'::jsonb);

-- ---------- photos de la librairie ----------
create table public.photos (
  id               uuid primary key default gen_random_uuid(),
  path             text not null,
  slot             text not null default 'galerie' check (slot in ('devanture', 'interieur', 'rayons', 'equipe', 'evenements', 'galerie')),
  alt              text not null check (char_length(alt) between 3 and 200),
  caption          text check (char_length(caption) <= 200),
  credit           text check (char_length(credit) <= 120),
  rights_confirmed boolean not null default false,
  published        boolean not null default true,
  position         integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null
);
create trigger photos_touch before update on public.photos for each row execute function public.touch_row();
alter table public.photos enable row level security;
-- Une photo n'est publique que si elle est publiée ET que l'autorisation de diffusion est confirmée.
create policy "photos: lecture publique" on public.photos for select to anon, authenticated
  using ((published and rights_confirmed) or public.is_staff());
create policy "photos: ajout équipe" on public.photos for insert to authenticated with check (public.is_staff());
create policy "photos: modification équipe" on public.photos for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "photos: suppression équipe" on public.photos for delete to authenticated using (public.is_staff());
revoke all on public.photos from anon;
grant select (id, path, slot, alt, caption, credit, position) on public.photos to anon;

-- ---------- tableau de bord ----------
create or replace function public.admin_stats()
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'books',        (select count(*) from public.books where archived_at is null),
    'published',    (select count(*) from public.books where published and archived_at is null),
    'drafts',       (select count(*) from public.books where not published and archived_at is null),
    'archived',     (select count(*) from public.books where archived_at is not null),
    'out_of_stock', (select count(*) from public.books where availability = 'out_of_stock' and archived_at is null),
    'no_category',  (select count(*) from public.books where category_id is null and archived_at is null),
    'no_price',     (select count(*) from public.books where price is null and archived_at is null),
    'no_cover',     (select count(*) from public.books where cover_path is null and cover_url is null and archived_at is null),
    'is_new',       (select count(*) from public.books where is_new and archived_at is null),
    'bestsellers',  (select count(*) from public.books where is_bestseller and archived_at is null),
    'picks',        (select count(*) from public.books where is_staff_pick and archived_at is null),
    'upcoming',     (select count(*) from public.events where starts_at >= now() and not cancelled),
    'photos',       (select count(*) from public.photos),
    'last_sync',    (select max(created_at) from public.sync_runs)
  )
  where public.is_staff();
$$;
revoke execute on function public.admin_stats() from anon;
