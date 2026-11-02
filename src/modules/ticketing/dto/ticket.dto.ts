import { z } from 'zod';
import type { TicketStatus } from '../domain/ticket-status';

export const ClaimTicketInputSchema = z.object({
  ticket_type_id: z.string().uuid('ID kategori tiket tidak valid'),
  quantity: z.number().int().min(1, 'Jumlah tiket minimal 1').max(5, 'Jumlah tiket maksimal 5').default(1),
  idempotency_key: z.string().max(100).optional(),
});

export type ClaimTicketInput = z.infer<typeof ClaimTicketInputSchema>;

export const CancelTicketInputSchema = z.object({
  ticket_id: z.string().uuid('ID tiket tidak valid'),
  reason: z.string().min(5, 'Alasan pembatalan wajib diisi minimal 5 karakter'),
});

export type CancelTicketInput = z.infer<typeof CancelTicketInputSchema>;

export interface ClaimTicketResultDTO {
  success: boolean;
  code: string;
  message?: string;
  replayed?: boolean;
  tickets?: {
    ticket_id: string;
    qr_token: string;
  }[];
  remaining?: number;
}

export interface TicketTypeDTO {
  id: string;
  event_id: string;
  name: string;
  price_idr: number;
  quota_total: number;
  quota_claimed: number;
  remaining_quota: number;
  max_per_user: number;
  sale_starts_at: string;
  sale_ends_at: string;
  is_active: boolean;
  availability: 'Tersedia' | 'Hampir Habis' | 'Habis';
}

export interface MyTicketDTO {
  id: string;
  ticket_type_id: string;
  ticket_type_name: string;
  qr_token: string;
  status: TicketStatus;
  claimed_at: string;
  used_at: string | null;
  cancelled_at: string | null;
}

export interface AdminTicketDTO {
  id: string;
  ticket_type_id: string;
  ticket_type_name: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  status: TicketStatus;
  claimed_at: string;
  used_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
}
