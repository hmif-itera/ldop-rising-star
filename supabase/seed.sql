-- supabase/seed.sql
-- Sumber kebenaran: Bab 8.7.2 SKPL PRD TERRAFEST (Terra Festival ITERA)

insert into public.catalog_venues (id, name, address)
values ('00000000-0000-0000-0000-0000000000a1', 'Lapangan Utama ITERA', 'Lampung Selatan')
on conflict (id) do nothing;

insert into public.catalog_events (id, slug, name, venue_id, starts_at, ends_at, is_published)
values ('00000000-0000-0000-0000-0000000000e1', 'terrafest-2026', 'Terra Festival 2026',
        '00000000-0000-0000-0000-0000000000a1',
        '2026-12-12 10:00:00+07', '2026-12-12 23:00:00+07', true)
on conflict (id) do nothing;

insert into public.ticket_types (id, event_id, name, price_idr, quota_total, max_per_user, sale_starts_at, sale_ends_at)
values
  ('00000000-0000-0000-0000-0000000000t1', '00000000-0000-0000-0000-0000000000e1', 'Regular',   0, 3000, 2, now() - interval '1 hour', now() + interval '30 days'),
  ('00000000-0000-0000-0000-0000000000t2', '00000000-0000-0000-0000-0000000000e1', 'Early Bird', 0,  500, 2, now() - interval '1 hour', now() + interval '7 days')
on conflict (id) do nothing;

insert into public.attendance_gates (id, event_id, name)
values ('00000000-0000-0000-0000-0000000000g1', '00000000-0000-0000-0000-0000000000e1', 'Gate A'),
       ('00000000-0000-0000-0000-0000000000g2', '00000000-0000-0000-0000-0000000000e1', 'Gate B')
on conflict (id) do nothing;
