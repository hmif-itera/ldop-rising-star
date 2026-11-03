import { NextResponse } from 'next/server';
import { attendanceService } from '@/modules/attendance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await attendanceService.verifyAndCheckin(body);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kesalahan verifikasi gate.';
    return NextResponse.json(
      {
        success: false,
        code: 'UNAUTHORIZED',
        message,
      },
      { status: 400 }
    );
  }
}
