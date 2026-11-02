export interface AppErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: AppErrorDetails;

  constructor(code: string, message: string, status = 400, details?: AppErrorDetails) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static unauthenticated(message = 'Sesi tidak valid atau telah berakhir. Silakan masuk kembali.') {
    return new AppError('UNAUTHENTICATED', message, 401);
  }

  static forbidden(message = 'Anda tidak memiliki hak akses untuk melakukan aksi ini.') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message = 'Data yang diminta tidak ditemukan.') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static badRequest(message: string, details?: AppErrorDetails) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }

  static internal(message = 'Terjadi kesalahan internal pada sistem.') {
    return new AppError('INTERNAL_ERROR', message, 500);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
      },
    };
  }
}
