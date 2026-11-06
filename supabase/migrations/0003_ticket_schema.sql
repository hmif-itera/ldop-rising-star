create type public.ticket_status as enum ('ACTIVE', 'USED', 'CANCELLED');

create table public.ticket_types (
  id              uuid primary key default gen_random_uuid(),
  -- CROSS-MODULE: referensi stabil ke EventCatalog (disetujui arsitek)
  event_id        uuid not null references public.catalog_events (id) on delete restrict,
  name            text not null,
  description     text,
  price_idr       numeric(12,2) not null default 0 check (price_idr >= 0),
  quota_total     integer not null check (quota_total > 0),
  quota_claimed   integer not null default 0 check (quota_claimed >= 0),
  max_per_user    smallint not null default 2 check (max_per_user between 1 and 10),
  sale_starts_at  timestamptz not null,
  sale_ends_at    timestamptz not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (event_id, name),
  constraint ck_ticket_types_sale_window check (sale_ends_at > sale_starts_at),
  -- JARING PENGAMAN TERAKHIR terhadap overselling, berlaku walau terjadi bug aplikasi
  constraint ck_ticket_types_quota_not_exceeded check (quota_claimed <= quota_total)
);

create table public.ticket_tickets (
  id               uuid primary key default gen_random_uuid(),
  ticket_type_id   uuid not null references public.ticket_types (id) on delete restrict,
  -- CROSS-MODULE: identitas pemilik dari modul Shared
  owner_id         uuid not null references public.shared_profiles (id) on delete restrict,
  qr_token         text not null unique
                   default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status           public.ticket_status not null default 'ACTIVE',
  idempotency_key  text check (char_length(idempotency_key) <= 100),
  claimed_at       timestamptz not null default now(),
  used_at          timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  constraint ck_ticket_used_has_timestamp check (status <> 'USED' or used_at is not null)
);
create index ix_ticket_tickets_owner       on public.ticket_tickets (owner_id);
create index ix_ticket_tickets_type_status on public.ticket_tickets (ticket_type_id, status);
create index ix_ticket_tickets_idempotency on public.ticket_tickets (owner_id, ticket_type_id, idempotency_key)
  where idempotency_key is not null;

create trigger trg_ticket_types_updated
  before update on public.ticket_types
  for each row execute function public.shared_set_updated_at();
