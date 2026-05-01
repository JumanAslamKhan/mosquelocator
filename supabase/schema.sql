create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'owner',
  mosque_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.mosques (
  id text primary key,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  phone text,
  timings jsonb,
  owner_id uuid references auth.users(id) on delete set null,
  city text,
  description text,
  facilities text[] not null default '{}'::text[],
  photos text[] not null default '{}'::text[],
  view_count integer not null default 0,
  prayer_offset_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  banner_url text,
  created_at timestamptz not null default now()
);

alter table public.mosques enable row level security;
alter table public.users enable row level security;
alter table public.agents enable row level security;

create policy "Public read mosques" on public.mosques for select using (true);
create policy "Owners can insert mosques" on public.mosques for insert with check (auth.uid() = owner_id or owner_id is null);
create policy "Owners can update mosques" on public.mosques for update using (auth.uid() = owner_id);

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Public read agents" on public.agents for select using (true);