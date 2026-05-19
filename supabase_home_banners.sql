create table if not exists public.home_banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists home_banners_sort_idx
  on public.home_banners (is_active, sort_order, created_at);

alter table public.home_banners enable row level security;

drop policy if exists "Public read home banners" on public.home_banners;
create policy "Public read home banners"
on public.home_banners
for select
to public
using (true);

drop policy if exists "App manage home banners" on public.home_banners;
create policy "App manage home banners"
on public.home_banners
for all
to anon, authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('home-banners', 'home-banners', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "App can upload home banners" on storage.objects;
create policy "App can upload home banners"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'home-banners');

drop policy if exists "App can update home banners" on storage.objects;
create policy "App can update home banners"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'home-banners')
with check (bucket_id = 'home-banners');

drop policy if exists "App can delete home banners" on storage.objects;
create policy "App can delete home banners"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'home-banners');

drop policy if exists "Home banners are public readable" on storage.objects;
create policy "Home banners are public readable"
on storage.objects for select
to public
using (bucket_id = 'home-banners');
