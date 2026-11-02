import type { AttendanceResult } from './checkin-result';

export interface GateEntity {
  id: string;
  eventId: string;
  name: string;
  isActive: boolean;
}

export interface CheckinLogEntity {
  id: number;
  gateId: string | null;
  staffId: string | null;
  ticketId: string | null;
  ticketTypeId: string | null;
  tokenHash: string;
  result: AttendanceResult;
  scannedAt: Date;
}
