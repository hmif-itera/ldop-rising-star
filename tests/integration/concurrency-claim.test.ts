import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';

/**
 * Simulasi In-Memory Atomic Engine
 * Mereplikasi semantik PostgreSQL 'SELECT ... FOR UPDATE' dan Stored Procedure claim_ticket (Bab 8.6.1)
 */
class AtomicDatabaseMock {
  public ticketType = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Early Bird',
    quota_total: 10,
    quota_claimed: 0,
    max_per_user: 2,
    sale_starts_at: new Date(Date.now() - 3600000), // 1 hour ago
    sale_ends_at: new Date(Date.now() + 3600000),   // in 1 hour
    is_active: true,
  };

  public tickets: {
    id: string;
    ticket_type_id: string;
    owner_id: string;
    qr_token: string;
    idempotency_key: string | null;
    status: 'ACTIVE' | 'USED' | 'CANCELLED';
  }[] = [];

  // Mutex lock to simulate PostgreSQL row-level pessimistic lock (SELECT ... FOR UPDATE)
  private lockPromise: Promise<void> = Promise.resolve();

  async claimTicket(userId: string, quantity: number, idempotencyKey?: string) {
    let releaseLock: () => void = () => {};
    const currentLock = this.lockPromise;
    this.lockPromise = new Promise((resolve) => {
      releaseLock = resolve;
    });

    await currentLock;

    try {
      // 1. Validasi akun aktif
      if (!userId) {
        return { success: false, code: 'UNAUTHENTICATED' };
      }

      // 2. Validasi jumlah
      if (quantity < 1 || quantity > 5) {
        return { success: false, code: 'INVALID_QUANTITY' };
      }

      // 3. Row lock (simulated)
      const type = this.ticketType;

      // 4. Idempotensi
      if (idempotencyKey) {
        const existing = this.tickets.filter(
          (t) => t.owner_id === userId && t.ticket_type_id === type.id && t.idempotency_key === idempotencyKey
        );
        if (existing.length > 0) {
          return {
            success: true,
            code: 'OK',
            replayed: true,
            tickets: existing.map((t) => ({ ticket_id: t.id, qr_token: t.qr_token })),
            remaining: type.quota_total - type.quota_claimed,
          };
        }
      }

      // 5. Jendela penjualan
      const now = new Date();
      if (now < type.sale_starts_at) return { success: false, code: 'SALE_NOT_OPEN' };
      if (now > type.sale_ends_at) return { success: false, code: 'SALE_CLOSED' };

      // 6. Batas per akun
      const owned = this.tickets.filter(
        (t) => t.owner_id === userId && t.ticket_type_id === type.id && ['ACTIVE', 'USED'].includes(t.status)
      ).length;

      if (owned + quantity > type.max_per_user) {
        return { success: false, code: 'LIMIT_REACHED' };
      }

      // 7. Kuota
      if (type.quota_claimed + quantity > type.quota_total) {
        return { success: false, code: 'SOLD_OUT' };
      }

      // 8. Atomic Update
      type.quota_claimed += quantity;
      const newTickets = Array.from({ length: quantity }, () => {
        const t = {
          id: randomUUID(),
          ticket_type_id: type.id,
          owner_id: userId,
          qr_token: randomUUID().replace(/-/g, ''),
          idempotency_key: idempotencyKey || null,
          status: 'ACTIVE' as const,
        };
        this.tickets.push(t);
        return { ticket_id: t.id, qr_token: t.qr_token };
      });

      return {
        success: true,
        code: 'OK',
        replayed: false,
        tickets: newTickets,
        remaining: type.quota_total - type.quota_claimed,
      };
    } finally {
      releaseLock();
    }
  }
}

describe('Uji Konkurensi Anti-Overselling Ticketing (Bab 8.7.3: T-01 sampai T-03)', () => {
  it('T-01: Tepat 10 sukses dan 190 SOLD_OUT saat 200 pengguna klaim serentak pada kuota 10', async () => {
    const db = new AtomicDatabaseMock();
    db.ticketType.quota_total = 10;
    db.ticketType.quota_claimed = 0;

    // Buat 200 pengguna unik yang memanggil claimTicket secara paralel
    const users = Array.from({ length: 200 }, (_, i) => `user_${i + 1}`);

    const results = await Promise.all(
      users.map((uid) => db.claimTicket(uid, 1, randomUUID()))
    );

    const okCount = results.filter((r) => r.code === 'OK').length;
    const soldOutCount = results.filter((r) => r.code === 'SOLD_OUT').length;

    // Verifikasi hasil expected T-01
    expect(okCount).toBe(10);
    expect(soldOutCount).toBe(190);
    expect(db.ticketType.quota_claimed).toBe(10);
    expect(db.tickets.length).toBe(10);
  });

  it('T-02: Klik ganda dengan idempotency_key yang sama mengembalikan tiket yang sama dan replayed = true', async () => {
    const db = new AtomicDatabaseMock();
    const userId = 'user_click_twice';
    const sameKey = 'idempotent-key-xyz-123';

    // Dua panggilan paralel serentak dari satu pengguna dengan key yang sama
    const [resA, resB] = await Promise.all([
      db.claimTicket(userId, 1, sameKey),
      db.claimTicket(userId, 1, sameKey),
    ]);

    expect(resA.code).toBe('OK');
    expect(resB.code).toBe('OK');

    // Satu harus replayed = false, satu lagi replayed = true
    const replayedResults = [resA.replayed, resB.replayed];
    expect(replayedResults).toContain(false);
    expect(replayedResults).toContain(true);

    // Kuota yang terpakai hanya 1 tiket, bukan 2
    expect(db.ticketType.quota_claimed).toBe(1);
    expect(db.tickets.length).toBe(1);
  });

  it('T-03: Menolak klaim melebihi batas per akun (max_per_user = 2)', async () => {
    const db = new AtomicDatabaseMock();
    const userId = 'user_greedy';

    // Klaim pertama (1 tiket) -> Sukses
    const res1 = await db.claimTicket(userId, 1, randomUUID());
    expect(res1.code).toBe('OK');

    // Klaim kedua (1 tiket) -> Sukses (total 2)
    const res2 = await db.claimTicket(userId, 1, randomUUID());
    expect(res2.code).toBe('OK');

    // Klaim ketiga (1 tiket) -> Ditolak LIMIT_REACHED
    const res3 = await db.claimTicket(userId, 1, randomUUID());
    expect(res3.code).toBe('LIMIT_REACHED');
    expect(res3.success).toBe(false);

    // Total kuota terpakai untuk akun ini tetap 2
    expect(db.tickets.filter((t) => t.owner_id === userId).length).toBe(2);
  });
});
