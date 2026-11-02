import { createServerClient } from '@/modules/shared';
import type { AttendanceResult } from '../domain/checkin-result';
import type {
  GateDTO,
  CheckinLogDTO,
  VerifyCheckinResultDTO,
  AttendanceSummaryDTO,
} from '../dto/attendance.dto';

interface JoinedLogItem {
  id: number;
  gate_id: string | null;
  staff_id: string | null;
  ticket_id: string | null;
  result: AttendanceResult;
  scanned_at: string;
  attendance_gates: { name: string } | null;
}

export class AttendanceRepository {
  static async listActiveGates(eventId?: string): Promise<GateDTO[]> {
    const supabase = await createServerClient();
    let query = supabase.from('attendance_gates').select('*').eq('is_active', true).order('name', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as GateDTO[];
  }

  static async callVerifyAndCheckinRPC(
    qrToken: string,
    gateId: string
  ): Promise<VerifyCheckinResultDTO> {
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('verify_and_checkin_ticket', {
      p_qr_token: qrToken,
      p_gate_id: gateId,
    });

    if (error) {
      return {
        success: false,
        code: 'UNAUTHORIZED',
        message: error.message || 'Verifikasi gagal diproses di gate.',
      };
    }

    return data as VerifyCheckinResultDTO;
  }

  static async listStaffLogs(staffId: string, limit = 50): Promise<CheckinLogDTO[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('attendance_checkin_logs')
      .select(`
        id,
        gate_id,
        staff_id,
        ticket_id,
        result,
        scanned_at,
        attendance_gates (name)
      `)
      .eq('staff_id', staffId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const rows = data as unknown as JoinedLogItem[];
    return rows.map((r) => ({
      id: r.id,
      gate_id: r.gate_id,
      gate_name: r.attendance_gates?.name ?? 'Gate',
      staff_id: r.staff_id,
      ticket_id: r.ticket_id,
      result: r.result,
      scanned_at: r.scanned_at,
    }));
  }

  static async getAttendanceSummary(): Promise<AttendanceSummaryDTO> {
    const supabase = await createServerClient();
    const { count, error } = await supabase
      .from('attendance_checkin_logs')
      .select('*', { count: 'exact', head: true })
      .eq('result', 'SUCCESS');

    if (error) {
      return { total_checkins: 0, by_category: [] };
    }

    return {
      total_checkins: count ?? 0,
      by_category: [],
    };
  }
}
