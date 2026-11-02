import { createServerClient } from '@/modules/shared';
import type { TicketTypeDTO, MyTicketDTO, ClaimTicketResultDTO } from '../dto/ticket.dto';
import { calculateRemainingQuota, getAvailabilityLabel } from '../domain/ticket.entity';
import type { Database } from '@/modules/shared';

type TicketTypeRow = Database['public']['Tables']['ticket_types']['Row'];

interface JoinedTicketRow {
  id: string;
  ticket_type_id: string;
  qr_token: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
  claimed_at: string;
  used_at: string | null;
  cancelled_at: string | null;
  ticket_types: {
    name: string;
  } | null;
}

export class TicketRepository {
  static async listTicketTypes(eventId: string): Promise<TicketTypeDTO[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .order('price_idr', { ascending: true });

    if (error || !data) return [];

    const rows = data as unknown as TicketTypeRow[];

    return rows.map((t) => {
      const remaining = calculateRemainingQuota(t.quota_total, t.quota_claimed);
      return {
        id: t.id,
        event_id: t.event_id,
        name: t.name,
        price_idr: Number(t.price_idr),
        quota_total: t.quota_total,
        quota_claimed: t.quota_claimed,
        remaining_quota: remaining,
        max_per_user: t.max_per_user,
        sale_starts_at: t.sale_starts_at,
        sale_ends_at: t.sale_ends_at,
        is_active: t.is_active,
        availability: getAvailabilityLabel(remaining, t.quota_total),
      };
    });
  }

  static async getTicketTypeById(id: string): Promise<TicketTypeDTO | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as unknown as TicketTypeRow;
    const remaining = calculateRemainingQuota(row.quota_total, row.quota_claimed);

    return {
      id: row.id,
      event_id: row.event_id,
      name: row.name,
      price_idr: Number(row.price_idr),
      quota_total: row.quota_total,
      quota_claimed: row.quota_claimed,
      remaining_quota: remaining,
      max_per_user: row.max_per_user,
      sale_starts_at: row.sale_starts_at,
      sale_ends_at: row.sale_ends_at,
      is_active: row.is_active,
      availability: getAvailabilityLabel(remaining, row.quota_total),
    };
  }

  static async listTicketsByOwner(ownerId: string): Promise<MyTicketDTO[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('ticket_tickets')
      .select(`
        id,
        ticket_type_id,
        qr_token,
        status,
        claimed_at,
        used_at,
        cancelled_at,
        ticket_types (name)
      `)
      .eq('owner_id', ownerId)
      .order('claimed_at', { ascending: false });

    if (error || !data) return [];

    const rows = data as unknown as JoinedTicketRow[];
    return rows.map((row) => ({
      id: row.id,
      ticket_type_id: row.ticket_type_id,
      ticket_type_name: row.ticket_types?.name ?? 'Tiket Festival',
      qr_token: row.qr_token,
      status: row.status,
      claimed_at: row.claimed_at,
      used_at: row.used_at,
      cancelled_at: row.cancelled_at,
    }));
  }

  static async callClaimTicketRPC(
    ticketTypeId: string,
    quantity: number,
    idempotencyKey?: string
  ): Promise<ClaimTicketResultDTO> {
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('claim_ticket', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
      p_idempotency_key: idempotencyKey ?? null,
    });

    if (error) {
      return {
        success: false,
        code: 'RPC_ERROR',
        message: error.message || 'Gagal memanggil transaksi klaim tiket.',
      };
    }

    return data as ClaimTicketResultDTO;
  }

  static async getTicketByToken(token: string): Promise<{
    id: string;
    ticket_type_id: string;
    owner_id: string;
    status: 'ACTIVE' | 'USED' | 'CANCELLED';
    used_at: string | null;
  } | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('ticket_tickets')
      .select('id, ticket_type_id, owner_id, status, used_at')
      .eq('qr_token', token)
      .maybeSingle();

    if (error || !data) return null;
    return data as {
      id: string;
      ticket_type_id: string;
      owner_id: string;
      status: 'ACTIVE' | 'USED' | 'CANCELLED';
      used_at: string | null;
    };
  }
}
