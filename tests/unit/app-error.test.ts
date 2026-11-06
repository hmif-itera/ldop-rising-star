import { describe, it, expect } from 'vitest';
import { AppError } from '@/modules/shared';

describe('AppError', () => {
  it('creates an AppError instance with correct properties', () => {
    const error = new AppError('TEST_CODE', 'Test error message', 400, { field: 'name' });
    expect(error.name).toBe('AppError');
    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test error message');
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ field: 'name' });
  });

  it('correctly creates unauthenticated error (401)', () => {
    const error = AppError.unauthenticated();
    expect(error.code).toBe('UNAUTHENTICATED');
    expect(error.status).toBe(401);
  });

  it('correctly creates forbidden error (403)', () => {
    const error = AppError.forbidden();
    expect(error.code).toBe('FORBIDDEN');
    expect(error.status).toBe(403);
  });

  it('correctly creates not found error (404)', () => {
    const error = AppError.notFound();
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
  });

  it('serializes to JSON format per FR-AUD-02 specification', () => {
    const error = new AppError('SPEC_ERR', 'Spesifikasi galat terstruktur', 422, { key: 'value' });
    const json = error.toJSON();
    expect(json).toEqual({
      error: {
        code: 'SPEC_ERR',
        message: 'Spesifikasi galat terstruktur',
        status: 422,
        details: { key: 'value' },
      },
    });
  });
});

