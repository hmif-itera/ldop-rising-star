import { describe, it, expect } from 'vitest';
import {
  ClaimTicketInputSchema,
  calculateRemainingQuota,
  getAvailabilityLabel,
  isSaleWindowOpen,
  TicketStatusLabel,
} from '@/modules/ticketing';

describe('Ticketing Module Unit Tests (Milestone 3)', () => {
  describe('Quota & Availability Logic', () => {
    it('calculates remaining quota correctly and never goes below zero', () => {
      expect(calculateRemainingQuota(100, 50)).toBe(50);
      expect(calculateRemainingQuota(100, 100)).toBe(0);
      expect(calculateRemainingQuota(100, 110)).toBe(0);
    });

    it('assigns correct availability labels (Tersedia, Hampir Habis, Habis)', () => {
      expect(getAvailabilityLabel(100, 100)).toBe('Tersedia');
      expect(getAvailabilityLabel(5, 100)).toBe('Hampir Habis');
      expect(getAvailabilityLabel(0, 100)).toBe('Habis');
      expect(getAvailabilityLabel(-1, 100)).toBe('Habis');
    });

    it('validates sale window correctly', () => {
      const start = new Date('2026-11-01T00:00:00Z');
      const end = new Date('2026-12-01T00:00:00Z');

      const before = new Date('2026-10-31T23:59:59Z');
      const during = new Date('2026-11-15T12:00:00Z');
      const after = new Date('2026-12-01T00:00:01Z');

      expect(isSaleWindowOpen(start, end, before)).toBe(false);
      expect(isSaleWindowOpen(start, end, during)).toBe(true);
      expect(isSaleWindowOpen(start, end, after)).toBe(false);
    });

    it('maps all ticket statuses to Indonesian labels', () => {
      expect(TicketStatusLabel.ACTIVE).toBe('Aktif');
      expect(TicketStatusLabel.USED).toBe('Sudah Digunakan');
      expect(TicketStatusLabel.CANCELLED).toBe('Dibatalkan');
    });
  });

  describe('Claim Input Validation (Zod)', () => {
    it('accepts valid claim ticket input', () => {
      const valid = {
        ticket_type_id: '00000000-0000-0000-0000-000000000001',
        quantity: 1,
        idempotency_key: 'test-key-123',
      };
      const result = ClaimTicketInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid quantity (< 1 or > 5)', () => {
      const tooLow = {
        ticket_type_id: '00000000-0000-0000-0000-000000000001',
        quantity: 0,
      };
      const tooHigh = {
        ticket_type_id: '00000000-0000-0000-0000-000000000001',
        quantity: 6,
      };
      expect(ClaimTicketInputSchema.safeParse(tooLow).success).toBe(false);
      expect(ClaimTicketInputSchema.safeParse(tooHigh).success).toBe(false);
    });

    it('rejects invalid uuid for ticket_type_id', () => {
      const invalid = {
        ticket_type_id: 'not-a-uuid',
        quantity: 1,
      };
      expect(ClaimTicketInputSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
