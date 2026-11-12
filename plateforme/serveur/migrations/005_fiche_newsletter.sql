-- Fiches produits complètes et newsletter.

-- Composition (ex. « 95 % polyester, 5 % élasthane »), affichée seulement si renseignée.
alter table produits add column composition text not null default '';

-- Inscriptions à la newsletter, par boutique (isolées comme le reste).
create table newsletter (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutiques (id) on delete cascade,
  email text not null check (email = lower(email)),
  created_at timestamptz not null default now(),
  unique (boutique_id, email)
);
alter table newsletter enable row level security;
alter table newsletter force row level security;
create policy boutique_isolee on newsletter
  using (boutique_id = boutique_courante() or acces_taches())
  with check (boutique_id = boutique_courante() or acces_taches());
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'portant_app') then
    grant select, insert, delete on newsletter to portant_app;
  end if;
end $$;
