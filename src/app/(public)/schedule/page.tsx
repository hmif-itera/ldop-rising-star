import { catalogService, ScheduleTable } from '@/modules/event-catalog';
import { Calendar, Clock } from 'lucide-react';

export const revalidate = 60; // FR-CAT-08

export default async function SchedulePage() {
  const event = await catalogService.getActiveEvent();
  const stages = event ? await catalogService.listStages(event.id) : [];
  const schedules = event ? await catalogService.getSchedule(event.id) : [];

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>Rundown Panggung</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Jadwal Acara</h1>
        <p className="mt-3 text-muted-foreground text-base leading-relaxed">
          Rencanakan waktu kunjungan Anda dan jangan lewatkan penampilan artis favorit Anda di panggung TERRAFEST.
        </p>
      </div>

      {!event ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 opacity-30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Jadwal Belum Dipublikasikan</h3>
          <p className="mt-1 text-sm">Panitia akan segera mempublikasikan jadwal rundown resmi.</p>
        </div>
      ) : (
        <ScheduleTable schedules={schedules} stages={stages} />
      )}
    </div>
  );
}
