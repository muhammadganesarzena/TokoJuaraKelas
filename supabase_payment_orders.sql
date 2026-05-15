create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref_number text unique,
  pickup_code text,
  fulfillment_type text not null default 'pickup',
  payment_method text not null default 'qris',
  payment_status text not null default 'waiting_verification',
  payment_proof_url text,
  customer_name text,
  email text,
  phone text,
  order_note text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  admin_fee numeric not null default 0,
  total_price numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists ref_number text;
alter table public.orders add column if not exists pickup_code text;
alter table public.orders add column if not exists fulfillment_type text default 'pickup';
alter table public.orders add column if not exists payment_method text default 'qris';
alter table public.orders add column if not exists payment_status text default 'waiting_verification';
alter table public.orders add column if not exists payment_proof_url text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists order_note text;
alter table public.orders add column if not exists items jsonb default '[]'::jsonb;
alter table public.orders add column if not exists subtotal numeric default 0;
alter table public.orders add column if not exists admin_fee numeric default 0;

alter table public.orders enable row level security;

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated can update orders for admin dashboard" on public.orders;
create policy "Authenticated can update orders for admin dashboard"
on public.orders for update
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Users can upload payment proofs" on storage.objects;
create policy "Users can upload payment proofs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-proofs');

drop policy if exists "Payment proofs are public readable" on storage.objects;
create policy "Payment proofs are public readable"
on storage.objects for select
to public
using (bucket_id = 'payment-proofs');
