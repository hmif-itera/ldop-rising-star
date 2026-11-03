create table public.catalog_venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  latitude    numeric(9,6),
  longitude   numeric(9,6),
  map_url     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.catalog_events (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  terms         text,
  venue_id      uuid references public.catalog_venues (id) on delete set null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ck_catalog_events_period check (ends_at > starts_at)
);

create table public.catalog_artists (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  genre          text,
  bio            text,
  photo_url      text,
  instagram_url  text,
  spotify_url    text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.catalog_stages (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references public.catalog_events (id) on delete cascade,
  name      text not null,
  unique (event_id, name)
);

create table public.catalog_schedules (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.catalog_events (id) on delete cascade,
  stage_id    uuid not null references public.catalog_stages (id) on delete restrict,
  artist_id   uuid not null references public.catalog_artists (id) on delete restrict,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  notes       text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ck_catalog_schedules_period check (ends_at > starts_at),
  -- FR-CAT-07: dua sesi pada panggung yang sama tidak boleh tumpang tindih
  constraint ex_catalog_schedules_no_overlap
    exclude using gist (stage_id with =, tstzrange(starts_at, ends_at) with &&)
    where (deleted_at is null)
);
create index ix_catalog_schedules_event_time on public.catalog_schedules (event_id, starts_at);

create table public.catalog_announcements (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.catalog_events (id) on delete cascade,
  title         text not null,
  body          text not null,
  is_pinned     boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create trigger trg_catalog_venues_updated    before update on public.catalog_venues    for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_events_updated    before update on public.catalog_events    for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_artists_updated   before update on public.catalog_artists   for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_schedules_updated before update on public.catalog_schedules for each row execute function public.shared_set_updated_at();
