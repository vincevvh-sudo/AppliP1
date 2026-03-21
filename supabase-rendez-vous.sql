-- Agenda & rendez-vous parents-enfant
-- À exécuter dans Supabase (SQL editor) sur le projet utilisé par l'application.

create table if not exists public.rendez_vous_creneaux (
  id bigint generated always as identity primary key,
  jour date not null,
  start_time time not null,
  end_time time not null,
  max_eleves integer not null default 1 check (max_eleves > 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.rendez_vous_reservations (
  id bigint generated always as identity primary key,
  creneau_id bigint not null references public.rendez_vous_creneaux(id) on delete cascade,
  eleve_id bigint not null references public.eleves(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (creneau_id, eleve_id)
);

create index if not exists rendez_vous_creneaux_jour_idx
  on public.rendez_vous_creneaux (jour, start_time);

create index if not exists rendez_vous_reservations_creneau_idx
  on public.rendez_vous_reservations (creneau_id);

-- Politiques RLS simples (à adapter si besoin)
alter table public.rendez_vous_creneaux enable row level security;
alter table public.rendez_vous_reservations enable row level security;

-- Ici on autorise tout le monde à lire les créneaux et réservations,
-- et à créer / supprimer ses propres réservations côté client anonyme.
-- Pour un usage réel, raffiner avec des authentifications Supabase.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rendez_vous_creneaux' and policyname = 'rendez_vous_creneaux_select_all'
  ) then
    create policy rendez_vous_creneaux_select_all
      on public.rendez_vous_creneaux
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rendez_vous_reservations' and policyname = 'rendez_vous_reservations_select_all'
  ) then
    create policy rendez_vous_reservations_select_all
      on public.rendez_vous_reservations
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rendez_vous_reservations' and policyname = 'rendez_vous_reservations_insert'
  ) then
    create policy rendez_vous_reservations_insert
      on public.rendez_vous_reservations
      for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rendez_vous_reservations' and policyname = 'rendez_vous_reservations_delete'
  ) then
    create policy rendez_vous_reservations_delete
      on public.rendez_vous_reservations
      for delete
      using (true);
  end if;
end$$;

