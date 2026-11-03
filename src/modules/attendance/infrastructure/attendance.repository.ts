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

interface AttendanceMetricLogItem {
  id: number;
  gate_id: string | null;
  result: AttendanceResult;
  scanned_at: string;
  attendance_gates: { name: string } | null;
}

export interface AttendanceExportLogItem {
  id: number;
  gate_id: string | null;
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

  static async getAdminAttendanceMetrics(): Promise<import('../dto/attendance.dto').AdminAttendanceMetricDTO> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('attendance_checkin_logs')
      .select(`
        id,
        gate_id,
        result,
        scanned_at,
        attendance_gates (name)
      `)
      .order('scanned_at', { ascending: false })
      .limit(500);

    const logs = (data || []) as unknown as AttendanceMetricLogItem[];

    const gates = await this.listActiveGates();
    const gateCountMap: Record<string, { name: string; count: number }> = {};
    for (const g of gates) {
      gateCountMap[g.id] = { name: g.name, count: 0 };
    }

    if (error || !logs) {
      return {
        total_checkins: 0,
        successful_checkins: 0,
        already_used_count: 0,
        invalid_token_count: 0,
        cancelled_count: 0,
        by_gate: gates.map((g) => ({ gate_id: g.id, gate_name: g.name, count: 0 })),
        arrival_rate_15m: [],
        recent_logs: [],
      };
    }

    let successCount = 0;
    let alreadyUsed = 0;
    let invalidToken = 0;
    let cancelled = 0;

    const bucketMap: Record<string, number> = {};

    for (const log of logs) {
      if (log.result === 'SUCCESS') successCount++;
      else if (log.result === 'ALREADY_USED') alreadyUsed++;
      else if (log.result === 'INVALID_TOKEN') invalidToken++;
      else if (log.result === 'CANCELLED') cancelled++;

      if (log.gate_id && gateCountMap[log.gate_id]) {
        gateCountMap[log.gate_id].count++;
      }

      const date = new Date(log.scanned_at);
      const minutes = Math.floor(date.getMinutes() / 15) * 15;
      const hours = String(date.getHours()).padStart(2, '0');
      const minStr = String(minutes).padStart(2, '0');
      const key = `${hours}:${minStr}`;
      bucketMap[key] = (bucketMap[key] || 0) + 1;
    }

    const arrivalRates = Object.entries(bucketMap)
      .map(([time_label, count]) => ({ time_label, count }))
      .slice(-10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentLogs = logs.slice(0, 10).map((l: any) => ({
      id: l.id,
      gate_name: l.attendance_gates?.name ?? 'Gate',
      result: l.result as AttendanceResult,
      scanned_at: l.scanned_at,
    }));

    return {
      total_checkins: logs.length,
      successful_checkins: successCount,
      already_used_count: alreadyUsed,
      invalid_token_count: invalidToken,
      cancelled_count: cancelled,
      by_gate: Object.entries(gateCountMap).map(([gate_id, val]) => ({
        gate_id,
        gate_name: val.name,
        count: val.count,
      })),
      arrival_rate_15m: arrivalRates,
      recent_logs: recentLogs,
    };
  }

  static async listAttendanceLogsForExport(filter: import('../dto/attendance.dto').AttendanceExportFilter) {
    const supabase = await createServerClient();
    let query = supabase
      .from('attendance_checkin_logs')
      .select(`
        id,
        gate_id,
        ticket_id,
        result,
        scanned_at,
        attendance_gates (name)
      `)
      .order('scanned_at', { ascending: false });

    if (filter.gateId) {
      query = query.eq('gate_id', filter.gateId);
    }
    if (filter.startDate) {
      query = query.gte('scanned_at', filter.startDate);
    }
    if (filter.endDate) {
      query = query.lte('scanned_at', filter.endDate);
    }
    if (filter.result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.eq('result', filter.result as any);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as unknown as AttendanceExportLogItem[];
  }
}
