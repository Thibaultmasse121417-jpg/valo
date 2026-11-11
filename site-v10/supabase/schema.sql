-- Base en ligne de la boutique (Supabase).
-- À lancer une fois dans Supabase > SQL Editor, sur un projet dédié aux boutiques.
-- Un même projet peut servir plusieurs boutiques : chaque pièce porte l'identifiant
-- de sa boutique (BOUTIQUE dans src/config.js), et chaque compte n'écrit que chez lui.

create table if not exists public.pieces (
  id uuid primary key default gen_random_uuid(),
  boutique text not null,
  ordre integer not null default 0,
  visible boolean not null default true,
  nouveau boolean not null default false,
  nom text not null,
  type text not null default 'Pièce',
  famille text not null default 'hauts',
  prix numeric(10, 2) not null check (prix >= 0),
  texte text not null default '',
  tailles text[] not null default array['S', 'M', 'L'],
  couleurs jsonb not null default '[]'::jsonb, -- [{ nom, hex, face, dos }]
  created_at timestamptz not null default now()
);
create index if not exists pieces_boutique_ordre on public.pieces (boutique, ordre);

-- Qui gère quelle boutique : une ligne par compte (Authentication > Users).
create table if not exists public.gerants (
  user_id uuid primary key references auth.users (id) on delete cascade,
  boutique text not null
);

alter table public.pieces enable row level security;
alter table public.gerants enable row level security;

-- Les clients voient les pièces en ligne ; le gérant voit aussi ses pièces masquées.
drop policy if exists "lecture publique" on public.pieces;
create policy "lecture publique" on public.pieces for select
  using (visible or boutique = (select g.boutique from public.gerants g where g.user_id = auth.uid()));

drop policy if exists "gerant ecrit" on public.pieces;
create policy "gerant ecrit" on public.pieces for all to authenticated
  using (boutique = (select g.boutique from public.gerants g where g.user_id = auth.uid()))
  with check (boutique = (select g.boutique from public.gerants g where g.user_id = auth.uid()));

drop policy if exists "gerant se voit" on public.gerants;
create policy "gerant se voit" on public.gerants for select to authenticated using (user_id = auth.uid());

-- Photos : dossier public « pieces », un sous-dossier par boutique.
insert into storage.buckets (id, name, public)
values ('pieces', 'pieces', true)
on conflict (id) do nothing;

drop policy if exists "photos gerant ajoute" on storage.objects;
create policy "photos gerant ajoute" on storage.objects for insert to authenticated
  with check (bucket_id = 'pieces' and (storage.foldername(name))[1] = (select g.boutique from public.gerants g where g.user_id = auth.uid()));

drop policy if exists "photos gerant supprime" on storage.objects;
create policy "photos gerant supprime" on storage.objects for delete to authenticated
  using (bucket_id = 'pieces' and (storage.foldername(name))[1] = (select g.boutique from public.gerants g where g.user_id = auth.uid()));

-- Ensuite, pour chaque boutique :
-- 1. Authentication > Users > Add user : l'e-mail et le mot de passe de la boutique.
-- 2. insert into public.gerants (user_id, boutique) values ('<id du compte>', 'alba');
