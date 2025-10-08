
-- FULL SCHEMA + ADMIN + LOCATIONS SEED

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin','applicant')) default 'applicant',
  created_at timestamptz default now()
);
create unique index if not exists profiles_user_id_key on public.profiles(user_id);

create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null,
  address text,
  hours text,
  phone text,
  created_at timestamptz default now()
);
alter table public.locations
  add column if not exists brand text
  check (brand in ('Cloud 9 Vapes','The Hemp and Kratom Depot'))
  default 'Cloud 9 Vapes';

create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text not null,
  position text not null,
  location_id uuid references public.locations(id) on delete set null,
  status text not null default 'Pending'
    check (status in ('Pending','Under Review','Interview','Hired','Rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
drop trigger if exists trg_set_updated_at on public.applications;
create trigger trg_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

alter table public.locations enable row level security;
alter table public.applications enable row level security;
alter table public.profiles enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = uid and p.role = 'admin'
  );
$$;

drop policy if exists "locations read all" on public.locations;
create policy "locations read all" on public.locations for select using (true);
drop policy if exists "locations admin write" on public.locations;
create policy "locations admin write" on public.locations
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

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

drop policy if exists "profiles select self admin" on public.profiles;
create policy "profiles select self admin" on public.profiles
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles
  for insert with check (auth.uid() = user_id);
drop policy if exists "profiles update self admin" on public.profiles;
create policy "profiles update self admin" on public.profiles
  for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

insert into public.profiles (user_id, role)
values ('b0a20c1d-f704-4d94-b903-cf4f5e56531d','admin')
on conflict (user_id) do update set role = 'admin';

insert into public.locations (store_name, address, hours, phone, brand) values
  ('Cloud 9 Vapes — Hillcrest Rd', '2315 Hillcrest Rd, Mobile, AL 36695', 'Open 24/7', null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — Airport Blvd', '3913 Airport Blvd, Mobile, AL 36608', null, null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — Moffett Rd', '7885 Moffett Rd, Semmes, AL 36575', null, null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — Daphne (Hwy 98)', '27080 Hwy 98, Daphne, AL 36526', 'Open 24/7', null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — D''Iberville (Sangani Blvd)', '3586 Sangani Blvd, D''Iberville, MS 39540', '24/7', null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — Saraland (Shell St)', '29 Shell St, Saraland, AL 36571', 'Soon To Be 24/7', null, 'Cloud 9 Vapes'),
  ('Cloud 9 Vapes — Rangeline Rd (Tillman’s Corner)', '4439 Rangeline Rd, Tillman’s Corner', null, null, 'Cloud 9 Vapes'),
  ('The Hemp and Kratom Depot — Moss Point', '3506 Main St, Moss Point, MS 39563', null, null, 'The Hemp and Kratom Depot');
