import { attendanceService } from '@/modules/attendance';
import { AttendanceMonitorClient } from './attendance-monitor-client';

export const dynamic = 'force-dynamic';

export default async function AdminAttendancePage() {
  const [gates, initialMetrics] = await Promise.all([
    attendanceService.listGates(),
    attendanceService.getAdminAttendanceMetrics(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AttendanceMonitorClient gates={gates} initialMetrics={initialMetrics} />
    </div>
  );
}
