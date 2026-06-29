create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  public_slug text not null unique,
  winner_count integer not null check (winner_count > 0),
  alternate_count integer not null default 0 check (alternate_count >= 0),
  preregistration_opens_at timestamptz not null,
  preregistration_closes_at timestamptz not null,
  live_registration_closes_at timestamptz not null,
  eligibility_rules text not null,
  preregistration_open boolean not null default false,
  live_registration_open boolean not null default false,
  locked_at timestamptz,
  final_participant_count integer,
  verification_hash text,
  draw_executed_at timestamptz,
  draw_admin_id uuid references public.admins(id),
  created_at timestamptz not null default now()
);

do $$
begin
  create type registration_source as enum ('preregistration', 'live', 'representative_entry');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type attendance_status as enum ('yes', 'no', 'not_sure');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type eligibility_status as enum ('valid', 'duplicate', 'rejected', 'pending');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type result_type as enum ('winner', 'alternate');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.representatives (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  relationship_to_participant text not null,
  reason_participant_absent text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  entry_number integer not null,
  full_name text not null,
  email text not null,
  phone text not null,
  city_state text not null,
  attendance_status attendance_status,
  registration_source registration_source not null,
  representative_id uuid references public.representatives(id),
  eligibility_status eligibility_status not null default 'pending',
  duplicate_reasons text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, entry_number)
);

create table if not exists public.draw_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.participants(id),
  rank integer not null,
  result_type result_type not null,
  drawn_at timestamptz not null default now(),
  unique (event_id, participant_id),
  unique (event_id, result_type, rank)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  admin_id uuid references public.admins(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.representatives enable row level security;
alter table public.draw_results enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admins enable row level security;

drop policy if exists "public can read events" on public.events;
drop policy if exists "public can read draw results" on public.draw_results;
drop policy if exists "public can create participants when unlocked" on public.participants;
drop policy if exists "admins manage events" on public.events;
drop policy if exists "admins manage participants" on public.participants;
drop policy if exists "admins manage representatives" on public.representatives;
drop policy if exists "admins manage results" on public.draw_results;
drop policy if exists "admins read audit logs" on public.audit_logs;
drop policy if exists "prototype public can read participants" on public.participants;
drop policy if exists "prototype public can read representatives" on public.representatives;
drop policy if exists "prototype public can manage events" on public.events;
drop policy if exists "prototype public can manage participants" on public.participants;
drop policy if exists "prototype public can manage representatives" on public.representatives;
drop policy if exists "prototype public can manage results" on public.draw_results;
drop policy if exists "prototype public can create audit logs" on public.audit_logs;

create policy "public can read events" on public.events for select using (true);
create policy "public can read draw results" on public.draw_results for select using (true);
create policy "public can create participants when unlocked" on public.participants
  for insert with check (
    exists (
      select 1 from public.events
      where events.id = participants.event_id
      and events.locked_at is null
    )
  );
create policy "admins manage events" on public.events for all using (auth.uid() in (select id from public.admins));
create policy "admins manage participants" on public.participants for all using (auth.uid() in (select id from public.admins));
create policy "admins manage representatives" on public.representatives for all using (auth.uid() in (select id from public.admins));
create policy "admins manage results" on public.draw_results for all using (auth.uid() in (select id from public.admins));
create policy "admins read audit logs" on public.audit_logs for select using (auth.uid() in (select id from public.admins));

-- Prototype access for the current unauthenticated admin UI.
-- Replace these with authenticated admin policies before production use.
create policy "prototype public can read participants" on public.participants for select using (true);
create policy "prototype public can read representatives" on public.representatives for select using (true);
create policy "prototype public can manage events" on public.events for all using (true) with check (true);
create policy "prototype public can manage participants" on public.participants for all using (true) with check (true);
create policy "prototype public can manage representatives" on public.representatives for all using (true) with check (true);
create policy "prototype public can manage results" on public.draw_results for all using (true) with check (true);
create policy "prototype public can create audit logs" on public.audit_logs for insert with check (true);
