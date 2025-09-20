-- Indexes tuned for the main read paths used by the app.
create unique index if not exists institutions_slug_key on public.institutions (slug);
create index if not exists institutions_order_idx on public.institutions ("order");
create index if not exists institutions_name_search_idx
  on public.institutions using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(address, '')));
create index if not exists institutions_lat_lng_idx on public.institutions using btree (lat, lng);

create index if not exists products_institution_id_idx on public.products (institution_id);
create index if not exists products_name_idx on public.products (lower(name));

create index if not exists events_institution_id_idx on public.events (institution_id);
create index if not exists events_start_at_idx on public.events (start_at);

create index if not exists news_published_at_idx on public.news (published_at desc);
create index if not exists news_tags_idx on public.news using gin (tags);
