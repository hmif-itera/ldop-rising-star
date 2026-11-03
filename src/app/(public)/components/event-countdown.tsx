'use client';

import * as React from 'react';
import { Radio } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function EventCountdown({ targetDate = '2026-12-12T10:00:00+07:00' }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-1.5 sm:p-2 pr-4 rounded-3xl sm:rounded-full ios-glass-card ios-blur shadow-xl border border-white/20 dark:border-white/10">
      {/* Live Activity Dynamic Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-tight">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="flex items-center gap-1">
          <Radio className="h-3 w-3" />
          LIVE COUNTDOWN
        </span>
      </div>

      {/* Countdown Values */}
      <div className="flex items-center gap-3 sm:gap-4 text-center px-2 py-1">
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground font-mono">
            {mounted ? String(timeLeft.days).padStart(2, '0') : '--'}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Hari</span>
        </div>
        <span className="text-muted-foreground/40 font-bold -mt-2">:</span>
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground font-mono">
            {mounted ? String(timeLeft.hours).padStart(2, '0') : '--'}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Jam</span>
        </div>
        <span className="text-muted-foreground/40 font-bold -mt-2">:</span>
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground font-mono">
            {mounted ? String(timeLeft.minutes).padStart(2, '0') : '--'}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Mnt</span>
        </div>
        <span className="text-muted-foreground/40 font-bold -mt-2">:</span>
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
            {mounted ? String(timeLeft.seconds).padStart(2, '0') : '--'}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Dtk</span>
        </div>
      </div>
    </div>
  );
}
