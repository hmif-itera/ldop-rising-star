import { TicketRepository } from '../infrastructure/ticket.repository';
import { CancelTicketInputSchema, type CancelTicketInput } from '../dto/ticket.dto';

export async function cancelTicket(input: CancelTicketInput) {
  const validated = CancelTicketInputSchema.parse(input);
  return TicketRepository.callCancelTicketRPC(validated.ticket_id, validated.reason);
}

export async function listAdminTickets(filters?: { ticketTypeId?: string; status?: string }) {
  return TicketRepository.listAdminTickets(filters);
}

export async function listAllTicketTypes(eventId?: string) {
  return TicketRepository.listAllTicketTypes(eventId);
}

export async function getTicketExportDetails(ticketIds: string[]) {
  return TicketRepository.getTicketExportDetails(ticketIds);
}
