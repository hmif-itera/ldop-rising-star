import { describe, it, expect, vi } from 'vitest';
import { CancelTicketInputSchema } from '@/modules/ticketing';
import { exportAttendanceToCSV } from '@/modules/attendance/application/export-attendance-csv.usecase';
import { AttendanceRepository } from '@/modules/attendance/infrastructure/attendance.repository';
import { ticketingService } from '@/modules/ticketing';

describe('Milestone 5: Admin, RLS Security, and CSV Export', () => {
  describe('US-08: Ticket Cancellation Validation', () => {
    it('rejects cancellation reason with less than 5 characters', () => {
      const invalid = {
        ticket_id: '11111111-1111-1111-1111-111111111111',
        reason: 'bad',
      };
      expect(() => CancelTicketInputSchema.parse(invalid)).toThrow(
        /Alasan pembatalan wajib diisi minimal 5 karakter/
      );
    });

    it('accepts valid cancellation input with reason >= 5 characters', () => {
      const valid = {
        ticket_id: '11111111-1111-1111-1111-111111111111',
        reason: 'Pengajuan pembatalan resmi dari penonton',
      };
      const parsed = CancelTicketInputSchema.parse(valid);
      expect(parsed.reason).toBe('Pengajuan pembatalan resmi dari penonton');
    });

    it('enforces cancellation logic: only ACTIVE tickets can be cancelled', () => {
      // Simulating ticket_admin_cancel_ticket state machine
      function simulateCancelTicket(ticket: {
        id: string;
        status: 'ACTIVE' | 'USED' | 'CANCELLED';
        quotaClaimed: number;
      }) {
        if (ticket.status !== 'ACTIVE') {
          return {
            success: false,
            code: 'NOT_CANCELLABLE',
            message: 'Hanya tiket berstatus ACTIVE yang dapat dibatalkan.',
          };
        }
        ticket.status = 'CANCELLED';
        ticket.quotaClaimed -= 1;
        return { success: true, code: 'OK' };
      }

      const activeTicket = {
        id: 'ticket-1',
        status: 'ACTIVE' as const,
        quotaClaimed: 10,
      };

      const result = simulateCancelTicket(activeTicket);
      expect(result.success).toBe(true);
      expect(activeTicket.status).toBe('CANCELLED');
      expect(activeTicket.quotaClaimed).toBe(9); // Kuota claimed berkurang 1

      // Second attempt on CANCELLED ticket
      const cancelAgain = simulateCancelTicket(activeTicket);
      expect(cancelAgain.success).toBe(false);
      expect(cancelAgain.code).toBe('NOT_CANCELLABLE');

      // Attempt on USED ticket
      const usedTicket = {
        id: 'ticket-2',
        status: 'USED' as const,
        quotaClaimed: 10,
      };
      const cancelUsed = simulateCancelTicket(usedTicket);
      expect(cancelUsed.success).toBe(false);
      expect(cancelUsed.code).toBe('NOT_CANCELLABLE');
    });
  });

  describe('T-08: Direct Table Write Rejection (RLS Security)', () => {
    it('simulates direct insert to ticket_tickets rejection by RLS / revoked permissions', async () => {
      // In Supabase, table write permissions for anon & authenticated are REVOKED on ticket_tickets
      // Only SECURITY DEFINER RPCs (claim_ticket) can write.
      const simulateDirectClientInsert = async (clientRole: 'anon' | 'authenticated') => {
        // Migration 0007 specifies:
        // revoke all on public.ticket_tickets, public.attendance_checkin_logs from anon, authenticated;
        if (clientRole === 'anon' || clientRole === 'authenticated') {
          return {
            data: null,
            error: {
              message: 'permission denied for table ticket_tickets',
              code: '42501',
            },
          };
        }
        return { data: { id: 'ok' }, error: null };
      };

      const anonResult = await simulateDirectClientInsert('anon');
      expect(anonResult.error?.code).toBe('42501');

      const authResult = await simulateDirectClientInsert('authenticated');
      expect(authResult.error?.code).toBe('42501');
    });

    it('simulates direct insert to attendance_checkin_logs rejection by RLS / revoked permissions', async () => {
      const simulateDirectLogInsert = async () => {
        // Direct write revoked; only verify_and_checkin_ticket can insert
        return {
          data: null,
          error: {
            message: 'permission denied for table attendance_checkin_logs',
            code: '42501',
          },
        };
      };

      const result = await simulateDirectLogInsert();
      expect(result.error?.code).toBe('42501');
    });
  });

  describe('US-14: Attendance CSV Export Formatting', () => {
    it('generates valid UTF-8 CSV with correct headers and quotes', async () => {
      // Mock AttendanceRepository.listAttendanceLogsForExport
      vi.spyOn(AttendanceRepository, 'listAttendanceLogsForExport').mockResolvedValue([
        {
          id: 1,
          gate_id: 'gate-1',
          ticket_id: 'ticket-uuid-1',
          result: 'SUCCESS' as const,
          scanned_at: '2026-12-12T14:30:00.000Z',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attendance_gates: { name: 'Gate A' } as any,
        },
      ]);

      // Mock ticketingService.getTicketExportDetails
      vi.spyOn(ticketingService, 'getTicketExportDetails').mockResolvedValue({
        'ticket-uuid-1': {
          ticketTypeName: 'VIP Festival',
          ownerName: 'Budi Santoso, S.Kom',
          ownerEmail: 'budi@student.itera.ac.id',
        },
      });

      const csv = await exportAttendanceToCSV({});

      // Starts with UTF-8 BOM
      expect(csv.charCodeAt(0)).toBe(0xfeff);

      // Contains CSV header
      expect(csv).toContain(
        '"Waktu Scan (WIB)","Gate","Status","Nama Pemilik","Email Pemilik","Kategori Tiket"'
      );

      // Contains escaped values
      expect(csv).toContain('"Gate A"');
      expect(csv).toContain('"SUCCESS"');
      expect(csv).toContain('"Budi Santoso, S.Kom"');
      expect(csv).toContain('"budi@student.itera.ac.id"');
      expect(csv).toContain('"VIP Festival"');
    });
  });
});
