import { describe, it, expect } from 'vitest';
import { hasRequiredRole } from '@/modules/shared';
import type { UserRole } from '@/modules/shared';

describe('Role Authorization Logic', () => {
  it('allows audience to access audience-only roles', () => {
    const role: UserRole = 'audience';
    expect(hasRequiredRole(role, ['audience'])).toBe(true);
    expect(hasRequiredRole(role, ['gate_staff', 'admin'])).toBe(false);
  });

  it('allows gate_staff to access gate_staff roles', () => {
    const role: UserRole = 'gate_staff';
    expect(hasRequiredRole(role, ['gate_staff'])).toBe(true);
    expect(hasRequiredRole(role, ['gate_staff', 'admin'])).toBe(true);
    expect(hasRequiredRole(role, ['admin'])).toBe(false);
  });

  it('allows admin to access admin roles', () => {
    const role: UserRole = 'admin';
    expect(hasRequiredRole(role, ['admin'])).toBe(true);
    expect(hasRequiredRole(role, ['gate_staff', 'admin'])).toBe(true);
  });

  it('rejects audience from admin routes', () => {
    const role: UserRole = 'audience';
    expect(hasRequiredRole(role, ['admin'])).toBe(false);
  });
});

