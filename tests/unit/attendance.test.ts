import { describe, it, expect } from 'vitest';
import {
  VerifyCheckinInputSchema,
  AttendanceResultBannerConfig,
} from '@/modules/attendance';

describe('Attendance Module Unit Tests (Milestone 4)', () => {
  describe('Input Validation', () => {
    it('accepts valid QR token and gate UUID', () => {
      const valid = {
        qr_token: 'valid-token-string-1234567890abcdef',
        gate_id: '00000000-0000-0000-0000-000000000001',
      };
      const result = VerifyCheckinInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects empty token', () => {
      const invalid = {
        qr_token: '',
        gate_id: '00000000-0000-0000-0000-000000000001',
      };
      expect(VerifyCheckinInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects invalid gate uuid', () => {
      const invalid = {
        qr_token: 'valid-token',
        gate_id: 'not-a-uuid',
      };
      expect(VerifyCheckinInputSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Banner Feedback Configuration (US-07 & NFR-USA-05)', () => {
    it('provides green high-contrast styling for SUCCESS', () => {
      const config = AttendanceResultBannerConfig.SUCCESS;
      expect(config.label).toContain('TIKET SAH');
      expect(config.bgClass).toContain('bg-green');
    });

    it('provides amber styling for ALREADY_USED', () => {
      const config = AttendanceResultBannerConfig.ALREADY_USED;
      expect(config.label).toContain('SUDAH PERNAH DIGUNAKAN');
      expect(config.bgClass).toContain('bg-amber');
    });

    it('provides red styling for INVALID_TOKEN, CANCELLED, and UNAUTHORIZED', () => {
      expect(AttendanceResultBannerConfig.INVALID_TOKEN.bgClass).toContain('bg-red');
      expect(AttendanceResultBannerConfig.CANCELLED.bgClass).toContain('bg-red');
      expect(AttendanceResultBannerConfig.UNAUTHORIZED.bgClass).toContain('bg-red');
    });
  });
});

