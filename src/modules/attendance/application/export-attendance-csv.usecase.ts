import { AttendanceRepository } from '../infrastructure/attendance.repository';
import type { AttendanceExportFilter, AdminAttendanceMetricDTO } from '../dto/attendance.dto';
import { ticketingService } from '@/modules/ticketing';

export async function getAdminAttendanceMetrics(): Promise<AdminAttendanceMetricDTO> {
  return AttendanceRepository.getAdminAttendanceMetrics();
}

function escapeCsvField(val: string | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function exportAttendanceToCSV(filters: AttendanceExportFilter): Promise<string> {
  const logs = await AttendanceRepository.listAttendanceLogsForExport(filters);

  // Extract unique ticket IDs
  const ticketIds: string[] = [];
  for (const log of logs) {
    if (log.ticket_id && !ticketIds.includes(log.ticket_id)) {
      ticketIds.push(log.ticket_id);
    }
  }

  // Cross-module query strictly via Public Service Interface
  const ticketDetails = await ticketingService.getTicketExportDetails(ticketIds);

  const headers = [
    'Waktu Scan (WIB)',
    'Gate',
    'Status',
    'Nama Pemilik',
    'Email Pemilik',
    'Kategori Tiket',
  ];

  const rows = logs.map((log) => {
    const details = log.ticket_id ? ticketDetails[log.ticket_id] : null;
    const waktuScan = new Date(log.scanned_at).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'short',
      timeStyle: 'medium',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gateName = (log as any).attendance_gates?.name ?? 'Gate';
    const status = log.result;
    const nama = details?.ownerName ?? '-';
    const email = details?.ownerEmail ?? '-';
    const kategori = details?.ticketTypeName ?? '-';

    return [
      escapeCsvField(waktuScan),
      escapeCsvField(gateName),
      escapeCsvField(status),
      escapeCsvField(nama),
      escapeCsvField(email),
      escapeCsvField(kategori),
    ].join(',');
  });

  // UTF-8 BOM for Excel compatibility + CSV headers & rows
  const csvContent =
    '\uFEFF' + [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');
  return csvContent;
}
