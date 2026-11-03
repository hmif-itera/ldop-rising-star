import { AttendanceRepository } from '../infrastructure/attendance.repository';
import type { GateDTO, CheckinLogDTO, AttendanceSummaryDTO } from '../dto/attendance.dto';
import { requireRole } from '@/modules/shared';

export async function listGates(eventId?: string): Promise<GateDTO[]> {
  await requireRole(['gate_staff', 'admin']);
  return AttendanceRepository.listActiveGates(eventId);
}

export async function getStaffRecentLogs(limit = 50): Promise<CheckinLogDTO[]> {
  const profile = await requireRole(['gate_staff', 'admin']);
  return AttendanceRepository.listStaffLogs(profile.id, limit);
}

export async function getAttendanceSummary(): Promise<AttendanceSummaryDTO> {
  await requireRole(['admin']);
  return AttendanceRepository.getAttendanceSummary();
}
