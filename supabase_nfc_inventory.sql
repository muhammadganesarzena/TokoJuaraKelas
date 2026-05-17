create extension if not exists "pgcrypto";

create table if not exists public.nfc_tags (
  id uuid primary key default gen_random_uuid(),
  uid text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.nfc_items (
  id uuid primary key default gen_random_uuid(),
  nfc_uid text not null references public.nfc_tags(uid) on delete cascade,
  product_name text not null,
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now()
);

alter table public.nfc_tags enable row level security;
alter table public.nfc_items enable row level security;

grant select, insert, update, delete on public.nfc_tags to anon, authenticated;
grant select, insert, update, delete on public.nfc_items to anon, authenticated;

drop policy if exists "App can manage nfc tags" on public.nfc_tags;
drop policy if exists "Authenticated can manage nfc tags" on public.nfc_tags;
create policy "App can manage nfc tags"
on public.nfc_tags
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "App can manage nfc items" on public.nfc_items;
drop policy if exists "Authenticated can manage nfc items" on public.nfc_items;
create policy "App can manage nfc items"
on public.nfc_items
for all
to anon, authenticated
using (true)
with check (true);

create index if not exists nfc_items_nfc_uid_idx on public.nfc_items(nfc_uid);
create index if not exists nfc_tags_uid_idx on public.nfc_tags(uid);
