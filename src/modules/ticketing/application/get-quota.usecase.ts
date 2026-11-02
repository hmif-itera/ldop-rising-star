import { TicketRepository } from '../infrastructure/ticket.repository';
import type { TicketTypeDTO } from '../dto/ticket.dto';

export async function getQuotaStatus(eventId: string): Promise<TicketTypeDTO[]> {
  return TicketRepository.listTicketTypes(eventId);
}

export async function getTicketByToken(qrToken: string) {
  return TicketRepository.getTicketByToken(qrToken);
}
