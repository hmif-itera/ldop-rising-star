/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import type { ScheduleItemDTO, StageDTO } from '../dto/catalog.dto';
import { Clock, MapPin } from 'lucide-react';

export interface ScheduleTableProps {
  schedules: ScheduleItemDTO[];
  stages: StageDTO[];
}

export function ScheduleTable({ schedules, stages }: ScheduleTableProps) {
  const [selectedStageId, setSelectedStageId] = React.useState<string>('all');

  const filtered = React.useMemo(() => {
    if (selectedStageId === 'all') return schedules;
    return schedules.filter((s) => s.stage_id === selectedStageId);
  }, [schedules, selectedStageId]);

  const formatTimeRange = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const end = new Date(endsAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${start} - ${end} WIB`;
  };

  return (
    <div className="space-y-6">
      {/* Stage Filter Buttons */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelectedStageId('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedStageId === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Semua Panggung ({schedules.length})
        </button>
        {stages.map((stage) => {
          const count = schedules.filter((s) => s.stage_id === stage.id).length;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedStageId === stage.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {stage.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Schedule Items List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 opacity-30 mb-3" />
          <p className="text-base font-medium">Belum ada jadwal penampil untuk panggung ini.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold overflow-hidden">
                  {item.artist_photo_url ? (
                    <img
                      src={item.artist_photo_url}
                      alt={item.artist_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Clock className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{item.artist_name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.stage_name}
                    </span>
                    {item.artist_genre && (
                      <>
                        <span>•</span>
                        <span>{item.artist_genre}</span>
                      </>
                    )}
                    {item.notes && (
                      <>
                        <span>•</span>
                        <span className="italic">{item.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold shrink-0">
                <Clock className="h-4 w-4 text-primary" />
                <span>{formatTimeRange(item.starts_at, item.ends_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
