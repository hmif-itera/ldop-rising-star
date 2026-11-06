import type { TicketStatus } from './ticket-status';

export interface TicketEntity {
  id: string;
  ticketTypeId: string;
  ownerId: string;
  qrToken: string;
  status: TicketStatus;
  idempotencyKey: string | null;
  claimedAt: Date;
  usedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
}

export interface TicketTypeEntity {
  id: string;
  eventId: string;
  name: string;
  priceIdr: number;
  quotaTotal: number;
  quotaClaimed: number;
  maxPerUser: number;
  saleStartsAt: Date;
  saleEndsAt: Date;
  isActive: boolean;
}

export function isSaleWindowOpen(startsAt: Date, endsAt: Date, now: Date = new Date()): boolean {
  return now >= startsAt && now <= endsAt;
}

export function calculateRemainingQuota(total: number, claimed: number): number {
  return Math.max(0, total - claimed);
}

export function getAvailabilityLabel(remaining: number, total: number): 'Tersedia' | 'Hampir Habis' | 'Habis' {
  if (remaining <= 0) return 'Habis';
  if (remaining <= Math.max(5, Math.floor(total * 0.1))) return 'Hampir Habis';
  return 'Tersedia';
}
