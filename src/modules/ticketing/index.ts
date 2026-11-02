/**
 * Ticketing Module - Public Service Interface
 * Single official entry point for ticket definitions, quotas, atomic claims, and QR issuance.
 */

// Use cases
export { claimTicket } from './application/claim-ticket.usecase';
export { listMyTickets } from './application/list-my-tickets.usecase';
export { getQuotaStatus, getTicketByToken } from './application/get-quota.usecase';
export {
  cancelTicket,
  listAdminTickets,
  listAllTicketTypes,
  getTicketExportDetails,
} from './application/cancel-ticket.usecase';

// Domain & DTOs
export {
  ClaimTicketInputSchema,
  CancelTicketInputSchema,
  type ClaimTicketInput,
  type CancelTicketInput,
  type ClaimTicketResultDTO,
  type TicketTypeDTO,
  type MyTicketDTO,
  type AdminTicketDTO,
} from './dto/ticket.dto';

export {
  type TicketStatus,
  TicketStatusLabel,
} from './domain/ticket-status';

export {
  calculateRemainingQuota,
  getAvailabilityLabel,
  isSaleWindowOpen,
} from './domain/ticket.entity';

// UI Components
export { TicketQR, type TicketQRProps } from './ui/ticket-qr';
export { ClaimButton, type ClaimButtonProps } from './ui/claim-button';

// Public Service Facade
import { claimTicket } from './application/claim-ticket.usecase';
import { listMyTickets } from './application/list-my-tickets.usecase';
import { getQuotaStatus, getTicketByToken } from './application/get-quota.usecase';
import {
  cancelTicket,
  listAdminTickets,
  listAllTicketTypes,
  getTicketExportDetails,
} from './application/cancel-ticket.usecase';

export const ticketingService = {
  claimTicket,
  listMyTickets,
  getQuotaStatus,
  getTicketByToken,
  cancelTicket,
  listAdminTickets,
  listAllTicketTypes,
  getTicketExportDetails,
};
