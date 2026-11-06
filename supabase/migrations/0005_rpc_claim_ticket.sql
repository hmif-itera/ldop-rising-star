create or replace function public.claim_ticket(
  p_ticket_type_id  uuid,
  p_quantity        integer default 1,
  p_idempotency_key text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_type    public.ticket_types%rowtype;
  v_owned   integer;
  v_tickets jsonb;
begin
  -- 1. Autentikasi
  if v_uid is null or not public.shared_is_active_user() then
    return jsonb_build_object('success', false, 'code', 'UNAUTHENTICATED',
             'message', 'Silakan masuk terlebih dahulu.');
  end if;

  -- 2. Validasi jumlah
  if p_quantity is null or p_quantity < 1 or p_quantity > 5 then
    return jsonb_build_object('success', false, 'code', 'INVALID_QUANTITY',
             'message', 'Jumlah tiket harus antara 1 dan 5.');
  end if;

  -- 3. KUNCI baris kategori: seluruh klaim serentak pada kategori ini antre di sini
  select * into v_type
    from public.ticket_types
   where id = p_ticket_type_id and is_active
     for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'TYPE_NOT_FOUND',
             'message', 'Kategori tiket tidak ditemukan.');
  end if;

  -- 4. Idempotensi: permintaan ulang dengan kunci sama mengembalikan hasil sebelumnya
  if p_idempotency_key is not null then
    select coalesce(jsonb_agg(jsonb_build_object('ticket_id', id, 'qr_token', qr_token)
                              order by claimed_at), '[]'::jsonb)
      into v_tickets
      from public.ticket_tickets
     where owner_id = v_uid
       and ticket_type_id = v_type.id
       and idempotency_key = p_idempotency_key;

    if jsonb_array_length(v_tickets) > 0 then
      return jsonb_build_object('success', true, 'code', 'OK', 'replayed', true,
               'tickets', v_tickets,
               'remaining', v_type.quota_total - v_type.quota_claimed);
    end if;
  end if;

  -- 5. Jendela penjualan (memakai waktu server)
  if now() < v_type.sale_starts_at then
    return jsonb_build_object('success', false, 'code', 'SALE_NOT_OPEN',
             'message', 'Penjualan belum dibuka.');
  end if;
  if now() > v_type.sale_ends_at then
    return jsonb_build_object('success', false, 'code', 'SALE_CLOSED',
             'message', 'Penjualan telah ditutup.');
  end if;

  -- 6. Batas per akun
  select count(*) into v_owned
    from public.ticket_tickets
   where owner_id = v_uid
     and ticket_type_id = v_type.id
     and status in ('ACTIVE', 'USED');

  if v_owned + p_quantity > v_type.max_per_user then
    return jsonb_build_object('success', false, 'code', 'LIMIT_REACHED',
             'message', format('Batas %s tiket per akun untuk kategori ini.', v_type.max_per_user));
  end if;

  -- 7. Kuota
  if v_type.quota_claimed + p_quantity > v_type.quota_total then
    return jsonb_build_object('success', false, 'code', 'SOLD_OUT',
             'message', 'Kuota tiket habis.');
  end if;

  -- 8. Tulis: penambahan penghitung dan penerbitan tiket dalam satu transaksi
  update public.ticket_types
     set quota_claimed = quota_claimed + p_quantity
   where id = v_type.id;

  with ins as (
    insert into public.ticket_tickets (ticket_type_id, owner_id, idempotency_key)
    select v_type.id, v_uid, p_idempotency_key
      from generate_series(1, p_quantity)
    returning id, qr_token
  )
  select jsonb_agg(jsonb_build_object('ticket_id', id, 'qr_token', qr_token))
    into v_tickets from ins;

  return jsonb_build_object('success', true, 'code', 'OK', 'replayed', false,
           'tickets', v_tickets,
           'remaining', v_type.quota_total - v_type.quota_claimed - p_quantity);
end;
$$;

revoke execute on function public.claim_ticket(uuid, integer, text) from public, anon;
grant  execute on function public.claim_ticket(uuid, integer, text) to authenticated;
