export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED';

export const TicketStatusLabel: Record<TicketStatus, string> = {
  ACTIVE: 'Aktif',
  USED: 'Sudah Digunakan',
  CANCELLED: 'Dibatalkan',
};
