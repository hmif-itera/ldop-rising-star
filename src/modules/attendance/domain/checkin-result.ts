export type AttendanceResult =
  | 'SUCCESS'
  | 'INVALID_TOKEN'
  | 'ALREADY_USED'
  | 'CANCELLED'
  | 'UNAUTHORIZED'
  | 'GATE_NOT_FOUND';

export const AttendanceResultBannerConfig: Record<
  AttendanceResult,
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    label: string;
    defaultMessage: string;
  }
> = {
  SUCCESS: {
    bgClass: 'bg-green-600 dark:bg-green-600',
    textClass: 'text-white',
    borderClass: 'border-green-700',
    label: 'TIKET SAH - SILAKAN MASUK',
    defaultMessage: 'Verifikasi berhasil.',
  },
  ALREADY_USED: {
    bgClass: 'bg-amber-500 dark:bg-amber-600',
    textClass: 'text-white',
    borderClass: 'border-amber-700',
    label: 'TIKET SUDAH PERNAH DIGUNAKAN',
    defaultMessage: 'Tiket ini telah di-scan sebelumnya.',
  },
  CANCELLED: {
    bgClass: 'bg-red-600 dark:bg-red-700',
    textClass: 'text-white',
    borderClass: 'border-red-800',
    label: 'TIKET DIBATALKAN',
    defaultMessage: 'Tiket ini telah dibatalkan oleh panitia.',
  },
  INVALID_TOKEN: {
    bgClass: 'bg-red-600 dark:bg-red-700',
    textClass: 'text-white',
    borderClass: 'border-red-800',
    label: 'TIKET TIDAK VALID',
    defaultMessage: 'QR Code tidak terdaftar dalam sistem.',
  },
  UNAUTHORIZED: {
    bgClass: 'bg-red-800 dark:bg-red-900',
    textClass: 'text-white',
    borderClass: 'border-red-950',
    label: 'AKSES DITOLAK',
    defaultMessage: 'Akun Anda bukan staf gerbang atau admin.',
  },
  GATE_NOT_FOUND: {
    bgClass: 'bg-red-600 dark:bg-red-700',
    textClass: 'text-white',
    borderClass: 'border-red-800',
    label: 'GATE TIDAK VALID',
    defaultMessage: 'Pilihan gate tidak ditemukan.',
  },
};
