insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "App can upload product images" on storage.objects;
create policy "App can upload product images"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'product-images');

drop policy if exists "App can update product images" on storage.objects;
create policy "App can update product images"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "Product images are public readable" on storage.objects;
create policy "Product images are public readable"
on storage.objects for select
to public
using (bucket_id = 'product-images');
