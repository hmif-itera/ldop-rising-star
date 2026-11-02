import { randomUUID } from 'node:crypto';
import { TicketRepository } from '../infrastructure/ticket.repository';
import { ClaimTicketInputSchema, type ClaimTicketInput, type ClaimTicketResultDTO } from '../dto/ticket.dto';
import { requireRole } from '@/modules/shared';

export async function claimTicket(input: ClaimTicketInput): Promise<ClaimTicketResultDTO> {
  // FR-TCK-03: Hanya pengguna terautentikasi yang dapat mengklaim tiket
  await requireRole(['audience', 'gate_staff', 'admin']);

  const validated = ClaimTicketInputSchema.parse(input);
  const idempotencyKey = validated.idempotency_key || randomUUID();

  // Memanggil RPC claim_ticket (SELECT ... FOR UPDATE di level DB)
  return TicketRepository.callClaimTicketRPC(
    validated.ticket_type_id,
    validated.quantity,
    idempotencyKey
  );
}
