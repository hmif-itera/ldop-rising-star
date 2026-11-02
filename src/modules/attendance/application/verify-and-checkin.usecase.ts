import { AttendanceRepository } from '../infrastructure/attendance.repository';
import {
  VerifyCheckinInputSchema,
  type VerifyCheckinInput,
  type VerifyCheckinResultDTO,
} from '../dto/attendance.dto';
import { requireRole } from '@/modules/shared';

export async function verifyAndCheckin(input: VerifyCheckinInput): Promise<VerifyCheckinResultDTO> {
  // FR-ATT-02 & US-06: Hanya staf gate atau admin yang dapat memverifikasi
  await requireRole(['gate_staff', 'admin']);

  const validated = VerifyCheckinInputSchema.parse(input);

  // Memanggil RPC verify_and_checkin_ticket (transaksi atomik anti-scan-ganda)
  return AttendanceRepository.callVerifyAndCheckinRPC(
    validated.qr_token,
    validated.gate_id
  );
}
