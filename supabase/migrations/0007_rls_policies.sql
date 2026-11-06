-- Migration 0007: Row Level Security Policies and Admin RPC
-- Sumber kebenaran: Bab 8.5 & 8.6.4 SKPL PRD TERRAFEST

-- 1) Aktifkan RLS pada seluruh tabel
do $$
declare t text;
begin
  foreach t in array array[
    'shared_profiles','shared_audit_logs',
    'catalog_venues','catalog_events','catalog_artists','catalog_stages',
    'catalog_schedules','catalog_announcements',
    'ticket_types','ticket_tickets',
    'attendance_gates','attendance_checkin_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 2) Pencabutan hak DML langsung pada tabel kritis
revoke all on public.ticket_tickets, public.attendance_checkin_logs, public.shared_audit_logs
  from anon, authenticated;
grant select on public.ticket_tickets, public.attendance_checkin_logs, public.shared_audit_logs
  to authenticated;

-- Profil: pengguna hanya boleh mengubah nama dan avatar, bukan peran
revoke insert, update, delete on public.shared_profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.shared_profiles to authenticated;

-- Katalog dan kategori tiket: anon hanya boleh membaca
revoke insert, update, delete on
  public.catalog_venues, public.catalog_events, public.catalog_artists, public.catalog_stages,
  public.catalog_schedules, public.catalog_announcements, public.ticket_types, public.attendance_gates
  from anon;

-- 3) shared_profiles
create policy shared_profiles_select_own_or_admin on public.shared_profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shared_is_admin());

create policy shared_profiles_update_own on public.shared_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 4) Katalog: publik membaca konten terbit
create policy catalog_events_public_read on public.catalog_events
  for select to anon, authenticated using (is_published);
create policy catalog_venues_public_read on public.catalog_venues
  for select to anon, authenticated using (true);
create policy catalog_artists_public_read on public.catalog_artists
  for select to anon, authenticated using (is_active);
create policy catalog_stages_public_read on public.catalog_stages
  for select to anon, authenticated using (true);
create policy catalog_schedules_public_read on public.catalog_schedules
  for select to anon, authenticated using (deleted_at is null);
create policy catalog_announcements_public_read on public.catalog_announcements
  for select to anon, authenticated using (true);

-- 5) Ticketing
create policy ticket_types_public_read on public.ticket_types
  for select to anon, authenticated using (is_active);

create policy ticket_tickets_select_own_or_admin on public.ticket_tickets
  for select to authenticated
  using (owner_id = (select auth.uid()) or public.shared_is_admin());

-- 6) Attendance
create policy attendance_gates_staff_read on public.attendance_gates
  for select to authenticated using (public.shared_is_staff());

create policy attendance_logs_select_scope on public.attendance_checkin_logs
  for select to authenticated
  using (staff_id = (select auth.uid()) or public.shared_is_admin());

-- 7) Audit: hanya admin yang dapat membaca
create policy shared_audit_admin_read on public.shared_audit_logs
  for select to authenticated using (public.shared_is_admin());

-- 8) Admin: akses penuh pada tabel konfigurasi dan konten
do $$
declare t text;
begin
  foreach t in array array[
    'catalog_venues','catalog_events','catalog_artists','catalog_stages',
    'catalog_schedules','catalog_announcements','ticket_types','attendance_gates'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.shared_is_admin()) with check (public.shared_is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- 9) Realtime: siarkan perubahan kuota dan check-in (tetap tunduk pada RLS)
alter publication supabase_realtime add table public.ticket_types, public.attendance_checkin_logs;

-- 10) Bab 8.6.4: Pembatalan Tiket oleh Admin
create or replace function public.ticket_admin_cancel_ticket(
  p_ticket_id uuid, p_reason text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_t public.ticket_tickets%rowtype;
begin
  if not public.shared_is_admin() then
    return jsonb_build_object('success', false, 'code', 'FORBIDDEN');
  end if;

  select * into v_t from public.ticket_tickets where id = p_ticket_id for update;
  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;
  if v_t.status <> 'ACTIVE' then
    return jsonb_build_object('success', false, 'code', 'NOT_CANCELLABLE',
             'message', 'Hanya tiket berstatus ACTIVE yang dapat dibatalkan.');
  end if;

  update public.ticket_tickets
     set status = 'CANCELLED', cancelled_at = now(), cancel_reason = p_reason
   where id = p_ticket_id;

  update public.ticket_types
     set quota_claimed = quota_claimed - 1
   where id = v_t.ticket_type_id;

  perform public.shared_write_audit('TICKET_CANCELLED', 'ticket', p_ticket_id::text,
            jsonb_build_object('status', v_t.status),
            jsonb_build_object('status', 'CANCELLED', 'reason', p_reason));

  return jsonb_build_object('success', true, 'code', 'OK');
end;
$$;

revoke execute on function public.ticket_admin_cancel_ticket(uuid, text) from public, anon;
grant  execute on function public.ticket_admin_cancel_ticket(uuid, text) to authenticated;

-- Fungsi shared juga dikunci
revoke execute on function public.shared_write_audit(text, text, text, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.shared_admin_set_user_role(uuid, public.shared_user_role) from public, anon;
grant  execute on function public.shared_admin_set_user_role(uuid, public.shared_user_role) to authenticated;
