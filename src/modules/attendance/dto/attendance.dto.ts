import { z } from 'zod';
import type { AttendanceResult } from '../domain/checkin-result';

export const VerifyCheckinInputSchema = z.object({
  qr_token: z.string().min(1, 'Token QR wajib diisi'),
  gate_id: z.string().uuid('ID Gate tidak valid'),
});

export type VerifyCheckinInput = z.infer<typeof VerifyCheckinInputSchema>;

export interface VerifyCheckinResultDTO {
  success: boolean;
  code: AttendanceResult;
  message: string;
  gate?: string;
  holder_name?: string;
  ticket_type?: string;
  used_at?: string;
}

export interface GateDTO {
  id: string;
  event_id: string;
  name: string;
  is_active: boolean;
}

export interface CheckinLogDTO {
  id: number;
  gate_id: string | null;
  gate_name: string;
  staff_id: string | null;
  ticket_id: string | null;
  result: AttendanceResult;
  scanned_at: string;
}

export interface AttendanceSummaryDTO {
  total_checkins: number;
  by_category: {
    ticket_type_id: string;
    count: number;
  }[];
}
