import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/modules/shared';
import { attendanceService } from '@/modules/attendance';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce admin role
    await requireRole(['admin']);

    const searchParams = request.nextUrl.searchParams;
    const gateId = searchParams.get('gate_id') || undefined;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const result = searchParams.get('result') || undefined;

    const csvData = await attendanceService.exportAttendanceToCSV({
      gateId,
      startDate,
      endDate,
      result,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `attendance_export_${timestamp}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: errorMsg }, { status: 403 });
  }
}

