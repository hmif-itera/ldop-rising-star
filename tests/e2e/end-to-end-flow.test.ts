import { describe, it, expect } from 'vitest';
import { calculateRemainingQuota, getAvailabilityLabel } from '@/modules/ticketing';
import { AttendanceResultBannerConfig } from '@/modules/attendance';

describe('Milestone 6: End-to-End System Flow (Bab 9 Verification)', () => {
  it('Phase A to G: Full lifecycle from catalog discovery, war ticket claim, gate check-in, to admin reconciliation', async () => {
    // -------------------------------------------------------------
    // Phase A & B: Event Catalog Discovery (Bab 9.1 A & B)
    // -------------------------------------------------------------
    const mockEvent = {
      id: '00000000-0000-0000-0000-0000000000e1',
      slug: 'terrafest-2026',
      name: 'Terra Festival 2026',
      starts_at: '2026-12-12T10:00:00+07:00',
      ends_at: '2026-12-12T23:00:00+07:00',
      is_published: true,
    };
    expect(mockEvent.is_published).toBe(true);

    // -------------------------------------------------------------
    // Phase C: War Ticket Claim & Atomic Allocation (Bab 9.1 C)
    // -------------------------------------------------------------
    let ticketTypeState = {
      id: '00000000-0000-0000-0000-0000000000t1',
      name: 'Regular',
      quota_total: 10,
      quota_claimed: 0,
      max_per_user: 2,
    };

    function simulateAtomicClaim(userId: string, quantity: number, userOwnedCount: number) {
      // Simulate RPC claim_ticket logic
      if (userOwnedCount + quantity > ticketTypeState.max_per_user) {
        return { success: false, code: 'LIMIT_REACHED' };
      }
      if (ticketTypeState.quota_claimed + quantity > ticketTypeState.quota_total) {
        return { success: false, code: 'SOLD_OUT' };
      }

      ticketTypeState.quota_claimed += quantity;
      const remaining = calculateRemainingQuota(ticketTypeState.quota_total, ticketTypeState.quota_claimed);

      const issuedTickets = Array.from({ length: quantity }, (_, idx) => ({
        ticket_id: `tkt-${userId}-${idx + 1}`,
        qr_token: `token-${userId}-${crypto.randomUUID()}`,
        status: 'ACTIVE' as 'ACTIVE' | 'USED' | 'CANCELLED',
      }));

      return {
        success: true,
        code: 'OK',
        tickets: issuedTickets,
        remaining,
      };
    }

    // User A claims 2 tickets
    const claimUserA = simulateAtomicClaim('user-a', 2, 0);
    expect(claimUserA.success).toBe(true);
    expect(claimUserA.code).toBe('OK');
    expect(claimUserA.tickets).toHaveLength(2);
    expect(ticketTypeState.quota_claimed).toBe(2);
    expect(calculateRemainingQuota(ticketTypeState.quota_total, ticketTypeState.quota_claimed)).toBe(8);

    // User A attempts to claim a 3rd ticket -> LIMIT_REACHED
    const claimLimitExceeded = simulateAtomicClaim('user-a', 1, 2);
    expect(claimLimitExceeded.success).toBe(false);
    expect(claimLimitExceeded.code).toBe('LIMIT_REACHED');

    // -------------------------------------------------------------
    // Phase D: Ticket Presentation (Bab 9.1 D)
    // -------------------------------------------------------------
    const ticketToScan = claimUserA.tickets![0];
    expect(ticketToScan.qr_token).toBeDefined();
    expect(ticketToScan.status).toBe('ACTIVE');

    // -------------------------------------------------------------
    // Phase E: Gate Check-in & Anti Double-Entry (Bab 9.1 E)
    // -------------------------------------------------------------
    const checkinLogTable: {
      gate_id: string;
      ticket_id: string;
      result: string;
      token_hash: string;
    }[] = [];

    function simulateVerifyAndCheckin(gateId: string, qrToken: string, ticketObj: typeof ticketToScan) {
      // Simulate RPC verify_and_checkin_ticket
      const tokenHash = `sha256(${qrToken})`;

      if (ticketObj.status === 'USED') {
        checkinLogTable.push({ gate_id: gateId, ticket_id: ticketObj.ticket_id, result: 'ALREADY_USED', token_hash: tokenHash });
        return {
          success: false,
          code: 'ALREADY_USED',
          message: 'Tiket sudah pernah digunakan.',
        };
      }

      if (ticketObj.status === 'CANCELLED') {
        checkinLogTable.push({ gate_id: gateId, ticket_id: ticketObj.ticket_id, result: 'CANCELLED', token_hash: tokenHash });
        return {
          success: false,
          code: 'CANCELLED',
          message: 'Tiket telah dibatalkan.',
        };
      }

      ticketObj.status = 'USED' as any;
      checkinLogTable.push({ gate_id: gateId, ticket_id: ticketObj.ticket_id, result: 'SUCCESS', token_hash: tokenHash });
      return {
        success: true,
        code: 'SUCCESS',
        message: 'Check-in berhasil. Silakan masuk.',
      };
    }

    // 1st Scan: Success
    const scan1 = simulateVerifyAndCheckin('gate-a', ticketToScan.qr_token, ticketToScan);
    expect(scan1.success).toBe(true);
    expect(scan1.code).toBe('SUCCESS');
    expect(AttendanceResultBannerConfig[scan1.code as keyof typeof AttendanceResultBannerConfig].label).toContain(
      'TIKET SAH'
    );

    // 2nd Scan: Immediate Rejection (ALREADY_USED)
    const scan2 = simulateVerifyAndCheckin('gate-a', ticketToScan.qr_token, ticketToScan);
    expect(scan2.success).toBe(false);
    expect(scan2.code).toBe('ALREADY_USED');
    expect(AttendanceResultBannerConfig[scan2.code as keyof typeof AttendanceResultBannerConfig].label).toContain(
      'SUDAH PERNAH DIGUNAKAN'
    );

    // Verify logs
    expect(checkinLogTable).toHaveLength(2);
    expect(checkinLogTable[0].result).toBe('SUCCESS');
    expect(checkinLogTable[1].result).toBe('ALREADY_USED');

    // -------------------------------------------------------------
    // Phase F: Admin Ticket Cancellation (US-08)
    // -------------------------------------------------------------
    const secondTicket = claimUserA.tickets![1]; // Still ACTIVE
    expect(secondTicket.status).toBe('ACTIVE');

    function simulateAdminCancel(ticketObj: typeof secondTicket, reason: string) {
      if (ticketObj.status !== 'ACTIVE') {
        return { success: false, code: 'NOT_CANCELLABLE' };
      }
      ticketObj.status = 'CANCELLED' as any;
      ticketTypeState.quota_claimed -= 1; // Quota returned
      return { success: true, code: 'OK' };
    }

    const cancelResult = simulateAdminCancel(secondTicket, 'Peserta batal menghadiri acara');
    expect(cancelResult.success).toBe(true);
    expect(secondTicket.status).toBe('CANCELLED');
    expect(ticketTypeState.quota_claimed).toBe(1); // Reduced back from 2 to 1!

    // Trying to check in with cancelled ticket
    const scanCancelled = simulateVerifyAndCheckin('gate-b', secondTicket.qr_token, secondTicket);
    expect(scanCancelled.success).toBe(false);
    expect(scanCancelled.code).toBe('CANCELLED');

    // -------------------------------------------------------------
    // Phase G: Post-Event Monitoring & Reconciliation (US-07 & US-14)
    // -------------------------------------------------------------
    const availability = getAvailabilityLabel(
      calculateRemainingQuota(ticketTypeState.quota_total, ticketTypeState.quota_claimed),
      ticketTypeState.quota_total
    );
    expect(availability).toBe('Tersedia');
  });
});
