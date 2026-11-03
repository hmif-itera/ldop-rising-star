-- Fungsi internal ticketing untuk menandai tiket terpakai (Bab 8.6.2)
create or replace function public.ticket_internal_mark_used(p_qr_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t      public.ticket_tickets%rowtype;
  v_type   text;
  v_holder text;
begin
  -- KUNCI baris tiket: scan serentak pada tiket yang sama diserialisasi di sini
  select * into v_t from public.ticket_tickets where qr_token = p_qr_token for update;

  if not found then
    return jsonb_build_object('outcome', 'NOT_FOUND');
  end if;

  select name into v_type from public.ticket_types where id = v_t.ticket_type_id;
  select coalesce(full_name, email) into v_holder from public.shared_profiles where id = v_t.owner_id;

  if v_t.status = 'CANCELLED' then
    return jsonb_build_object('outcome', 'CANCELLED', 'ticket_id', v_t.id,
             'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
             'holder_name', v_holder);
  end if;

  if v_t.status = 'USED' then
    return jsonb_build_object('outcome', 'ALREADY_USED', 'ticket_id', v_t.id,
             'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
             'holder_name', v_holder, 'used_at', v_t.used_at);
  end if;

  update public.ticket_tickets
     set status = 'USED', used_at = now()
   where id = v_t.id;

  return jsonb_build_object('outcome', 'MARKED_USED', 'ticket_id', v_t.id,
           'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
           'holder_name', v_holder, 'used_at', now());
end;
$$;

-- Tidak boleh dipanggil langsung oleh klien
revoke execute on function public.ticket_internal_mark_used(text) from public, anon, authenticated;

-- Fungsi verifikasi & check-in atomik di gate (Bab 8.6.3)
create or replace function public.verify_and_checkin_ticket(
  p_qr_token text,
  p_gate_id  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff     uuid := auth.uid();
  v_token     text := btrim(coalesce(p_qr_token, ''));
  v_hash      text;
  v_gate      public.attendance_gates%rowtype;
  v_mark      jsonb := null;
  v_result    public.attendance_result;
  v_ticket_id uuid;
  v_type_id   uuid;
begin
  -- 1. Otorisasi: hanya gate_staff atau admin
  if v_staff is null or not public.shared_is_staff() then
    return jsonb_build_object('success', false, 'code', 'UNAUTHORIZED',
             'message', 'Akses ditolak. Hanya gate staff atau admin.');
  end if;

  -- 2. Validasi gate
  select * into v_gate from public.attendance_gates where id = p_gate_id and is_active;
  if not found then
    return jsonb_build_object('success', false, 'code', 'GATE_NOT_FOUND',
             'message', 'Gate tidak ditemukan atau tidak aktif.');
  end if;

  -- 3. Hash token untuk log (token mentah tidak disimpan)
  v_hash := encode(sha256(convert_to(v_token, 'UTF8')), 'hex');

  -- 4. Verifikasi dan penandaan tiket (atomik, di bawah kunci baris tiket)
  if char_length(v_token) < 32 or char_length(v_token) > 128 then
    v_result := 'INVALID_TOKEN';
  else
    v_mark := public.ticket_internal_mark_used(v_token);
    v_result := (case v_mark ->> 'outcome'
                   when 'MARKED_USED'  then 'SUCCESS'
                   when 'ALREADY_USED' then 'ALREADY_USED'
                   when 'CANCELLED'    then 'CANCELLED'
                   else 'INVALID_TOKEN'
                 end)::public.attendance_result;
  end if;

  v_ticket_id := nullif(v_mark ->> 'ticket_id', '')::uuid;
  v_type_id   := nullif(v_mark ->> 'ticket_type_id', '')::uuid;

  -- 5. Catat log (sukses maupun gagal) dalam transaksi yang sama
  insert into public.attendance_checkin_logs
    (gate_id, staff_id, ticket_id, ticket_type_id, token_hash, result)
  values
    (v_gate.id, v_staff, v_ticket_id, v_type_id, v_hash, v_result);

  -- 6. Respons terstandar untuk banner di antarmuka gate
  return jsonb_build_object(
    'success',     v_result = 'SUCCESS',
    'code',        v_result::text,
    'message',     case v_result
                     when 'SUCCESS'      then 'Check-in berhasil. Silakan masuk.'
                     when 'ALREADY_USED' then 'Tiket sudah pernah digunakan.'
                     when 'CANCELLED'    then 'Tiket telah dibatalkan.'
                     else 'Tiket tidak valid.'
                   end,
    'gate',        v_gate.name,
    'holder_name', v_mark ->> 'holder_name',
    'ticket_type', v_mark ->> 'ticket_type_name',
    'used_at',     v_mark ->> 'used_at'
  );
end;
$$;

revoke execute on function public.verify_and_checkin_ticket(text, uuid) from public, anon;
grant  execute on function public.verify_and_checkin_ticket(text, uuid) to authenticated;
