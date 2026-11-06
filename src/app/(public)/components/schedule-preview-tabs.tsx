'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { ScheduleItemDTO } from '@/modules/event-catalog';

interface SchedulePreviewTabsProps {
  schedules?: ScheduleItemDTO[];
}

const DEFAULT_SCHEDULES = [
  {
    id: 's-1',
    stage_name: 'Terra Main Stage',
    artist_name: 'ITERA Symphony & Choir',
    time: '14:00 - 15:30 WIB',
    genre: 'Orchestral',
    badge: 'Opening Ceremony',
  },
  {
    id: 's-2',
    stage_name: 'Terra Main Stage',
    artist_name: 'Nadin Amizah',
    time: '16:00 - 17:30 WIB',
    genre: 'Folk / Indie Pop',
    badge: 'Sunset Special',
  },
  {
    id: 's-3',
    stage_name: 'Terra Main Stage',
    artist_name: 'Hindia',
    time: '19:30 - 21:00 WIB',
    genre: 'Indie Rock',
    badge: 'Headliner',
  },
  {
    id: 's-4',
    stage_name: 'Terra Main Stage',
    artist_name: '.Feast',
    time: '21:30 - 23:00 WIB',
    genre: 'Rock / Alternative',
    badge: 'Grand Finale',
  },
  {
    id: 's-5',
    stage_name: 'Nebula Stage',
    artist_name: 'Terra Acoustic Jam',
    time: '13:00 - 14:30 WIB',
    genre: 'Acoustic',
    badge: 'ITERA Talent',
  },
  {
    id: 's-6',
    stage_name: 'Nebula Stage',
    artist_name: 'Electronic Soundscapes',
    time: '15:30 - 17:00 WIB',
    genre: 'Synth / Electronic',
    badge: 'Experimental',
  },
  {
    id: 's-7',
    stage_name: 'Nebula Stage',
    artist_name: 'Lampung Roots Collective',
    time: '19:00 - 20:30 WIB',
    genre: 'World / Fusion',
    badge: 'Local Showcase',
  },
  {
    id: 's-8',
    stage_name: 'Nebula Stage',
    artist_name: 'Midnight Beats DJ Set',
    time: '21:00 - 22:30 WIB',
    genre: 'EDM / Dance',
    badge: 'Afterparty',
  },
];

export function SchedulePreviewTabs({ schedules }: SchedulePreviewTabsProps) {
  const [activeStage, setActiveStage] = React.useState<'Terra Main Stage' | 'Nebula Stage'>('Terra Main Stage');

  // Format real schedules if provided, otherwise fallback to curated sample
  const displayItems = React.useMemo(() => {
    if (schedules && schedules.length > 0) {
      return schedules
        .filter((s) => (s.stage_name ?? '').toLowerCase().includes(activeStage.toLowerCase().split(' ')[0]))
        .map((s) => ({
          id: s.id,
          stage_name: s.stage_name ?? activeStage,
          artist_name: s.artist_name ?? 'Penampil Tamu',
          time: `${new Date(s.starts_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(
            s.ends_at
          ).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
          genre: s.artist_genre ?? 'Music',
          badge: s.notes ?? 'Live Performance',
        }));
    }

    return DEFAULT_SCHEDULES.filter((s) => s.stage_name === activeStage);
  }, [schedules, activeStage]);

  return (
    <div className="space-y-6">
      {/* iOS Segmented Control */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-full ios-glass-card ios-blur border border-white/20 dark:border-white/10 shadow-md">
          <button
            onClick={() => setActiveStage('Terra Main Stage')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeStage === 'Terra Main Stage'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Terra Main Stage
          </button>
          <button
            onClick={() => setActiveStage('Nebula Stage')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeStage === 'Nebula Stage'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Nebula Stage
          </button>
        </div>
      </div>

      {/* Timeline Rows (iOS Card List Style) */}
      <div className="grid gap-3 max-w-3xl mx-auto">
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className="ios-glass-card ios-blur p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/20 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-200 group"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Apple-style squircle number/clock indicator */}
              <div className="h-10 w-10 rounded-xl bg-muted/80 text-foreground flex items-center justify-center shrink-0 font-mono text-xs font-bold border border-border/50 group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                #{index + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.artist_name}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {item.genre}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3 text-emerald-500" />
                    {item.time}
                  </span>
                  <span>•</span>
                  <span>{item.badge}</span>
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {item.stage_name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Lihat Rundown Lengkap & Detail Panggung</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
