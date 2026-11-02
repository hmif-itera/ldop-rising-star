import { TicketRepository } from '../infrastructure/ticket.repository';
import type { MyTicketDTO } from '../dto/ticket.dto';
import { requireRole } from '@/modules/shared';

export async function listMyTickets(): Promise<MyTicketDTO[]> {
  const profile = await requireRole(['audience', 'gate_staff', 'admin']);
  return TicketRepository.listTicketsByOwner(profile.id);
}
