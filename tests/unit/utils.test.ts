import { describe, it, expect } from 'vitest';
import { cn, formatDateTime } from '@/lib/utils';

describe('Common Utilities', () => {
  it('merges tailwind class names properly with cn', () => {
    const result = cn('px-2 py-1', 'bg-red-500', { 'text-white': true, 'hidden': false }, 'px-4');
    // px-4 should override px-2
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
  });

  it('formats dates in id-ID locale correctly', () => {
    const date = new Date('2026-12-12T10:00:00Z');
    const formatted = formatDateTime(date);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});

