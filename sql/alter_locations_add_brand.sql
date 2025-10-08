-- Adds a brand field to locations: 'Cloud 9 Vapes' or 'The Hemp and Kratom Depot'
alter table public.locations
add column if not exists brand text
  check (brand in ('Cloud 9 Vapes', 'The Hemp and Kratom Depot'))
  default 'Cloud 9 Vapes';
