grant select on public.admins to anon, authenticated;

alter table public.admins enable row level security;

drop policy if exists "App can read admins for login" on public.admins;
create policy "App can read admins for login"
on public.admins
for select
to anon, authenticated
using (true);
