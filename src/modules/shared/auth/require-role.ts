import { getCurrentUser } from './get-current-user';
import { AppError } from '../errors/app-error';
import type { Profile, UserRole } from '../types/database.types';

export async function requireRole(allowedRoles: UserRole[]): Promise<Profile> {
  const current = await getCurrentUser();

  if (!current) {
    throw AppError.unauthenticated('Silakan masuk untuk melanjutkan.');
  }

  if (!current.profile.is_active) {
    throw AppError.forbidden('Akun Anda dinonaktifkan. Hubungi panitia.');
  }

  if (!allowedRoles.includes(current.profile.role)) {
    throw AppError.forbidden(
      `Akses ditolak. Dibutuhkan peran [${allowedRoles.join(', ')}], peran Anda saat ini: ${current.profile.role}.`
    );
  }

  return current.profile;
}

export function hasRequiredRole(currentRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(currentRole);
}
