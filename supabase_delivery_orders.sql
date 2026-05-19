alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists house_note text;
alter table public.orders add column if not exists shipping_fee numeric not null default 0;
alter table public.orders add column if not exists store_lat numeric;
alter table public.orders add column if not exists store_lng numeric;
alter table public.orders add column if not exists delivery_lat numeric;
alter table public.orders add column if not exists delivery_lng numeric;
alter table public.orders add column if not exists delivery_distance_km numeric;

create index if not exists orders_fulfillment_type_idx
on public.orders (fulfillment_type);

create index if not exists orders_status_idx
on public.orders (status);
