import { describe, it, expect } from 'vitest';
import { hasRequiredRole, AppError } from '@/modules/shared';
import fs from 'node:fs';
import path from 'node:path';

describe('T-07: Eskalasi Peran dan Otorisasi (Bab 8.7.3)', () => {
  it('menolak akses pengguna dengan peran audience ke fungsi dan rute admin', () => {
    const userRole = 'audience';
    const isAllowed = hasRequiredRole(userRole, ['admin']);
    expect(isAllowed).toBe(false);
  });

  it('menolak akses pengguna dengan peran gate_staff ke rute admin', () => {
    const userRole = 'gate_staff';
    const isAllowed = hasRequiredRole(userRole, ['admin']);
    expect(isAllowed).toBe(false);
  });

  it('memastikan skema migrasi 0001 membatasi update peran hanya via RPC admin (shared_admin_set_user_role)', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/0001_shared_schema.sql');
    const content = fs.readFileSync(migrationPath, 'utf8');

    // Memastikan adanya proteksi admin check di dalam RPC
    expect(content).toContain('create or replace function public.shared_admin_set_user_role');
    expect(content).toContain('if not public.shared_is_admin() then');
    expect(content).toContain("'code', 'FORBIDDEN'");

    // Memastikan perlindungan admin terakhir (LAST_ADMIN)
    expect(content).toContain("'code', 'LAST_ADMIN'");

    // Memastikan audit log ditulis saat peran diubah
    expect(content).toContain('shared_write_audit');
    expect(content).toContain('USER_ROLE_CHANGED');
  });

  it('memastikan AppError menghasilkan status 403 saat terjadi pelanggaran izin', () => {
    const err = AppError.forbidden('Akses ditolak: role tidak memadai');
    expect(err.status).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});
