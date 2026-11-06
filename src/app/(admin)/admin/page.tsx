import { ticketingService } from '@/modules/ticketing';
import { attendanceService } from '@/modules/attendance';
import { DashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [ticketTypes, attendanceMetrics] = await Promise.all([
    ticketingService.listAllTicketTypes(),
    attendanceService.getAdminAttendanceMetrics(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardClient
        initialTicketTypes={ticketTypes}
        initialAttendance={attendanceMetrics}
      />
    </div>
  );
}
