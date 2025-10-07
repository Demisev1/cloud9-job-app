
-- Run this in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles (link to auth.users for role if desired later)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin','applicant')) default 'applicant',
  created_at timestamp with time zone default now()
);

-- locations
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null,
  address text,
  hours text,
  phone text,
  created_at timestamp with time zone default now()
);

-- applications
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text not null,
  position text not null,
  location_id uuid references public.locations(id) on delete set null,
  status text not null default 'Pending' check (status in ('Pending','Under Review','Interview','Hired','Rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.applications;
create trigger trg_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

-- RLS
alter table public.locations enable row level security;
alter table public.applications enable row level security;
alter table public.profiles enable row level security;

-- helper: check admin by email in profiles
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.user_id = uid and p.role = 'admin');
$$;

-- Policies: locations
drop policy if exists "locations read all" on public.locations;
create policy "locations read all" on public.locations
for select using (true);

drop policy if exists "locations admin write" on public.locations;
create policy "locations admin write" on public.locations
for all using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Policies: applications
drop policy if exists "apps select own" on public.applications;
create policy "apps select own" on public.applications
for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "apps insert self" on public.applications;
create policy "apps insert self" on public.applications
for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "apps update own admin" on public.applications;
create policy "apps update own admin" on public.applications
for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Policies: profiles
drop policy if exists "profiles select self admin" on public.profiles;
create policy "profiles select self admin" on public.profiles
for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles
for insert with check (auth.uid() = user_id);
create policy "profiles update self admin" on public.profiles
for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Seed an admin (after you create the user via Auth)
-- Replace YOUR_ADMIN_AUTH_USER_ID with the UUID from auth.users for Shane1661@gmail.com
-- insert into public.profiles (user_id, role) values ('YOUR_ADMIN_AUTH_USER_ID', 'admin');
