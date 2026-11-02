-- Ekstensi untuk constraint jadwal tidak bertabrakan
create extension if not exists btree_gist;

create type public.shared_user_role as enum ('audience', 'gate_staff', 'admin');

create or replace function public.shared_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.shared_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        public.shared_user_role not null default 'audience',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_shared_profiles_updated
  before update on public.shared_profiles
  for each row execute function public.shared_set_updated_at();

-- Profil otomatis saat pengguna pertama kali login Google (FR-AUTH-03)
create or replace function public.shared_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.shared_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.shared_handle_new_user();

-- Fungsi bantu otorisasi (membaca peran dari tabel, bukan dari JWT,
-- agar perubahan peran berlaku seketika)
create or replace function public.shared_current_role()
returns public.shared_user_role
language sql stable security definer set search_path = public as $$
  select role from public.shared_profiles where id = auth.uid() and is_active;
$$;

create or replace function public.shared_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.shared_current_role() = 'admin', false);
$$;

create or replace function public.shared_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.shared_current_role() in ('gate_staff', 'admin'), false);
$$;

create or replace function public.shared_is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shared_profiles where id = auth.uid() and is_active);
$$;

-- Audit log append-only (FR-AUD-01)
create table public.shared_audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.shared_profiles (id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);
create index ix_shared_audit_entity  on public.shared_audit_logs (entity_type, entity_id);
create index ix_shared_audit_created on public.shared_audit_logs (created_at desc);

create or replace function public.shared_audit_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'shared_audit_logs bersifat append-only';
end;
$$;

create trigger trg_shared_audit_immutable
  before update or delete on public.shared_audit_logs
  for each row execute function public.shared_audit_immutable();

create or replace function public.shared_write_audit(
  p_action text, p_entity_type text, p_entity_id text,
  p_old jsonb default null, p_new jsonb default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.shared_audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_old, p_new);
end;
$$;

-- Perubahan peran hanya melalui RPC admin (FR-AUTH-07)
create or replace function public.shared_admin_set_user_role(
  p_user_id uuid, p_role public.shared_user_role
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_old    public.shared_user_role;
  v_admins integer;
begin
  if not public.shared_is_admin() then
    return jsonb_build_object('success', false, 'code', 'FORBIDDEN');
  end if;

  select role into v_old from public.shared_profiles where id = p_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
  end if;

  if v_old = 'admin' and p_role <> 'admin' then
    select count(*) into v_admins from public.shared_profiles where role = 'admin' and is_active;
    if v_admins <= 1 then
      return jsonb_build_object('success', false, 'code', 'LAST_ADMIN');
    end if;
  end if;

  update public.shared_profiles set role = p_role where id = p_user_id;
  perform public.shared_write_audit('USER_ROLE_CHANGED', 'profile', p_user_id::text,
            jsonb_build_object('role', v_old), jsonb_build_object('role', p_role));

  return jsonb_build_object('success', true, 'code', 'OK');
end;
$$;
