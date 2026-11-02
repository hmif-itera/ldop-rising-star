import { describe, it, expect } from 'vitest';
import {
  CreateArtistSchema,
  CreateScheduleSchema,
  CreateAnnouncementSchema,
} from '@/modules/event-catalog';
import { isTimeOverlapping, validateSchedulePeriod } from '@/modules/event-catalog/domain/artist.entity';
import { validateEventDates } from '@/modules/event-catalog/domain/event.entity';

describe('EventCatalog Domain & Validation (Milestone 2)', () => {
  describe('Domain Rules', () => {
    it('validates event start and end dates (endsAt > startsAt)', () => {
      const validStart = new Date('2026-12-12T10:00:00Z');
      const validEnd = new Date('2026-12-12T23:00:00Z');
      expect(validateEventDates(validStart, validEnd)).toBe(true);

      const invalidEnd = new Date('2026-12-12T09:00:00Z');
      expect(validateEventDates(validStart, invalidEnd)).toBe(false);
    });

    it('detects schedule overlap on identical stage (FR-CAT-07)', () => {
      // Session A: 14:00 - 15:30
      const startA = new Date('2026-12-12T14:00:00Z');
      const endA = new Date('2026-12-12T15:30:00Z');

      // Session B overlaps with A: 15:00 - 16:00
      const startB = new Date('2026-12-12T15:00:00Z');
      const endB = new Date('2026-12-12T16:00:00Z');
      expect(isTimeOverlapping(startA, endA, startB, endB)).toBe(true);

      // Session C after A: 15:30 - 17:00 (exact boundary or later, non-overlapping)
      const startC = new Date('2026-12-12T15:30:00Z');
      const endC = new Date('2026-12-12T17:00:00Z');
      expect(isTimeOverlapping(startA, endA, startC, endC)).toBe(false);

      // Session D completely before A: 12:00 - 13:30
      const startD = new Date('2026-12-12T12:00:00Z');
      const endD = new Date('2026-12-12T13:30:00Z');
      expect(isTimeOverlapping(startA, endA, startD, endD)).toBe(false);
    });

    it('enforces schedule period validity', () => {
      const start = new Date('2026-12-12T14:00:00Z');
      const end = new Date('2026-12-12T15:00:00Z');
      expect(validateSchedulePeriod(start, end)).toBe(true);
      expect(validateSchedulePeriod(end, start)).toBe(false);
    });
  });

  describe('DTO Zod Validation', () => {
    it('validates correct artist input', () => {
      const valid = {
        name: 'The ITERA Band',
        genre: 'Indie Rock',
        bio: 'Band mahasiswa teknik ITERA',
        photo_url: 'https://example.com/photo.jpg',
        is_active: true,
      };
      const result = CreateArtistSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects artist with empty name', () => {
      const invalid = {
        name: 'A',
      };
      const result = CreateArtistSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('validates correct schedule input', () => {
      const valid = {
        event_id: '00000000-0000-0000-0000-000000000001',
        stage_id: '00000000-0000-0000-0000-000000000002',
        artist_id: '00000000-0000-0000-0000-000000000003',
        starts_at: '2026-12-12T14:00:00.000Z',
        ends_at: '2026-12-12T15:30:00.000Z',
        notes: 'Main Stage Opener',
      };
      const result = CreateScheduleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects schedule with ends_at earlier than starts_at', () => {
      const invalid = {
        event_id: '00000000-0000-0000-0000-000000000001',
        stage_id: '00000000-0000-0000-0000-000000000002',
        artist_id: '00000000-0000-0000-0000-000000000003',
        starts_at: '2026-12-12T16:00:00.000Z',
        ends_at: '2026-12-12T14:00:00.000Z',
      };
      const result = CreateScheduleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('validates announcement input', () => {
      const valid = {
        event_id: '00000000-0000-0000-0000-000000000001',
        title: 'Gate Dibuka Pukul 12:00 WIB',
        body: 'Harap membawa kartu identitas dan menunjukkan tiket ber-QR.',
        is_pinned: true,
      };
      const result = CreateAnnouncementSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});

