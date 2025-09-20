-- Row level security and access policies.
alter table public.institutions enable row level security;
alter table public.products enable row level security;
alter table public.events enable row level security;
alter table public.news enable row level security;

-- Institutions policies
drop policy if exists "Anon read institutions" on public.institutions;
drop policy if exists "Service role manage institutions" on public.institutions;
create policy "Anon read institutions"
  on public.institutions
  for select
  to anon, authenticated
  using (true);
create policy "Service role manage institutions"
  on public.institutions
  for all
  to service_role
  using (true)
  with check (true);

-- Products policies
drop policy if exists "Anon read products" on public.products;
drop policy if exists "Service role manage products" on public.products;
create policy "Anon read products"
  on public.products
  for select
  to anon, authenticated
  using (true);
create policy "Service role manage products"
  on public.products
  for all
  to service_role
  using (true)
  with check (true);

-- Events policies
drop policy if exists "Anon read events" on public.events;
drop policy if exists "Service role manage events" on public.events;
create policy "Anon read events"
  on public.events
  for select
  to anon, authenticated
  using (true);
create policy "Service role manage events"
  on public.events
  for all
  to service_role
  using (true)
  with check (true);

-- News policies
drop policy if exists "Anon read news" on public.news;
drop policy if exists "Service role manage news" on public.news;
create policy "Anon read news"
  on public.news
  for select
  to anon, authenticated
  using (true);
create policy "Service role manage news"
  on public.news
  for all
  to service_role
  using (true)
  with check (true);
