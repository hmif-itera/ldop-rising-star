import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';

/**
 * Simulasi Stored Procedure verify_and_checkin_ticket & ticket_internal_mark_used (Bab 8.6.2 & 8.6.3)
 */
class AttendanceSystemMock {
  public tickets = new Map<string, { id: string; qr_token: string; status: 'ACTIVE' | 'USED' | 'CANCELLED'; used_at: Date | null }>();
  public logs: { gate_id: string; staff_id: string; ticket_id: string | null; token_hash: string; result: string }[] = [];

  private mutex = Promise.resolve();

  constructor() {
    // Siapkan satu tiket aktif untuk pengujian scan ganda
    this.tickets.set('valid-token-1234567890abcdef1234567890', {
      id: 'ticket-uuid-001',
      qr_token: 'valid-token-1234567890abcdef1234567890',
      status: 'ACTIVE',
      used_at: null,
    });
  }

  async verifyAndCheckin(callerRole: string, staffId: string, gateId: string, qrToken: string) {
    let unlock: () => void = () => {};
    const prev = this.mutex;
    this.mutex = new Promise((resolve) => {
      unlock = resolve;
    });
    await prev;

    try {
      // 1. Otorisasi peran
      if (!['gate_staff', 'admin'].includes(callerRole)) {
        return { success: false, code: 'UNAUTHORIZED', message: 'Akses ditolak.' };
      }

      // 2. Hash token (token mentah tidak disimpan per FR-ATT-04)
      const tokenHash = crypto.createHash('sha256').update(qrToken).digest('hex');

      // 3. Verifikasi token
      const ticket = this.tickets.get(qrToken);
      let result = 'INVALID_TOKEN';
      let ticketId: string | null = null;

      if (!ticket) {
        result = 'INVALID_TOKEN';
      } else if (ticket.status === 'CANCELLED') {
        result = 'CANCELLED';
        ticketId = ticket.id;
      } else if (ticket.status === 'USED') {
        result = 'ALREADY_USED';
        ticketId = ticket.id;
      } else if (ticket.status === 'ACTIVE') {
        // Atomic status change to USED
        ticket.status = 'USED';
        ticket.used_at = new Date();
        result = 'SUCCESS';
        ticketId = ticket.id;
      }

      // 4. Catat log
      this.logs.push({
        gate_id: gateId,
        staff_id: staffId,
        ticket_id: ticketId,
        token_hash: tokenHash,
        result,
      });

      return {
        success: result === 'SUCCESS',
        code: result,
        message: result === 'SUCCESS' ? 'Silakan masuk.' : 'Ditolak.',
      };
    } finally {
      unlock();
    }
  }
}

describe('Uji Attendance & Verifikasi Gate (Bab 8.7.3: T-04 sampai T-06)', () => {
  it('T-04: Scan ganda serentak menghasilkan tepat 1 SUCCESS dan 1 ALREADY_USED', async () => {
    const system = new AttendanceSystemMock();
    const token = 'valid-token-1234567890abcdef1234567890';

    // Dua petugas memindai tiket yang sama secara bersamaan
    const [resA, resB] = await Promise.all([
      system.verifyAndCheckin('gate_staff', 'staff_1', 'gate_A', token),
      system.verifyAndCheckin('gate_staff', 'staff_2', 'gate_B', token),
    ]);

    const results = [resA.code, resB.code];
    expect(results).toContain('SUCCESS');
    expect(results).toContain('ALREADY_USED');

    // Pastikan di log hanya ada 1 SUCCESS
    const successLogs = system.logs.filter((l) => l.result === 'SUCCESS');
    const usedLogs = system.logs.filter((l) => l.result === 'ALREADY_USED');
    expect(successLogs.length).toBe(1);
    expect(usedLogs.length).toBe(1);
  });

  it('T-05: 1.000 token acak seluruhnya menghasilkan INVALID_TOKEN dan tercatat di log', async () => {
    const system = new AttendanceSystemMock();

    const randomTokens = Array.from({ length: 1000 }, () => crypto.randomUUID().replace(/-/g, ''));

    const results = await Promise.all(
      randomTokens.map((t) => system.verifyAndCheckin('gate_staff', 'staff_1', 'gate_A', t))
    );

    const allInvalid = results.every((r) => r.code === 'INVALID_TOKEN');
    expect(allInvalid).toBe(true);

    // Semua tercatat di log dengan token_hash (bukan token mentah)
    expect(system.logs.length).toBe(1000);
    expect(system.logs[0].token_hash).toHaveLength(64); // SHA-256 hex length
  });

  it('T-06: Pengguna dengan peran audience langsung ditolak dengan UNAUTHORIZED', async () => {
    const system = new AttendanceSystemMock();
    const res = await system.verifyAndCheckin('audience', 'user_123', 'gate_A', 'any-token');

    expect(res.success).toBe(false);
    expect(res.code).toBe('UNAUTHORIZED');
  });
});

