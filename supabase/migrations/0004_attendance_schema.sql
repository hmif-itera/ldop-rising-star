create type public.attendance_result as enum
  ('SUCCESS', 'INVALID_TOKEN', 'ALREADY_USED', 'CANCELLED', 'UNAUTHORIZED');

create table public.attendance_gates (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null,          -- referensi lunak ke catalog_events (tanpa FK)
  name       text not null,
  is_active  boolean not null default true,
  unique (event_id, name)
);

create table public.attendance_checkin_logs (
  id              bigint generated always as identity primary key,
  gate_id         uuid references public.attendance_gates (id) on delete set null,
  staff_id        uuid references public.shared_profiles (id) on delete set null,
  ticket_id       uuid,              -- referensi lunak ke ticket_tickets.id
  ticket_type_id  uuid,              -- salinan (snapshot) agar ringkasan tidak perlu join lintas modul
  token_hash      text not null,     -- SHA-256 dari token yang dipindai (token mentah tidak disimpan)
  result          public.attendance_result not null,
  scanned_at      timestamptz not null default now(),
  client_info     jsonb
);
create index ix_attendance_logs_scanned_at on public.attendance_checkin_logs (scanned_at desc);
create index ix_attendance_logs_staff      on public.attendance_checkin_logs (staff_id, scanned_at desc);
create index ix_attendance_logs_type       on public.attendance_checkin_logs (ticket_type_id) where result = 'SUCCESS';

-- Jaring pengaman: satu tiket hanya boleh memiliki satu check-in sukses
create unique index uq_attendance_one_success_per_ticket
  on public.attendance_checkin_logs (ticket_id) where result = 'SUCCESS';
