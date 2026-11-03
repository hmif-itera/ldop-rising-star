import { ticketingService } from '@/modules/ticketing';
import { TicketsManager } from './tickets-manager';

export const dynamic = 'force-dynamic';

export default async function AdminTicketTypesPage() {
  const [ticketTypes, tickets] = await Promise.all([
    ticketingService.listAllTicketTypes(),
    ticketingService.listAdminTickets(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <TicketsManager ticketTypes={ticketTypes} initialTickets={tickets} />
    </div>
  );
}
