alter table public.nfc_items add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('nfc-item-images', 'nfc-item-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "App can upload nfc item images" on storage.objects;
create policy "App can upload nfc item images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'nfc-item-images');

drop policy if exists "App can update nfc item images" on storage.objects;
create policy "App can update nfc item images"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'nfc-item-images')
with check (bucket_id = 'nfc-item-images');

drop policy if exists "App can delete nfc item images" on storage.objects;
create policy "App can delete nfc item images"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'nfc-item-images');

drop policy if exists "Nfc item images are public readable" on storage.objects;
create policy "Nfc item images are public readable"
on storage.objects for select
to public
using (bucket_id = 'nfc-item-images');
