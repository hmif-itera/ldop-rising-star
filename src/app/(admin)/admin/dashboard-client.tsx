'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/modules/shared';
import type { TicketTypeDTO } from '@/modules/ticketing';
import type { AdminAttendanceMetricDTO } from '@/modules/attendance';
import {
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  Radio,
  DoorOpen,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardClientProps {
  initialTicketTypes: TicketTypeDTO[];
  initialAttendance: AdminAttendanceMetricDTO;
}

export function DashboardClient({
  initialTicketTypes,
  initialAttendance,
}: DashboardClientProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel('admin-dashboard-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ticket_types' },
          () => {
            router.refresh();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'attendance_checkin_logs' },
          () => {
            router.refresh();
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // In offline / mock test environments
      setIsConnected(false);
    }
  }, [router]);

  const totalQuota = initialTicketTypes.reduce((acc, t) => acc + t.quota_total, 0);
  const totalClaimed = initialTicketTypes.reduce((acc, t) => acc + t.quota_claimed, 0);
  const totalRemaining = initialTicketTypes.reduce((acc, t) => acc + t.remaining_quota, 0);
  const claimPercent = totalQuota > 0 ? Math.round((totalClaimed / totalQuota) * 100) : 0;
  const attendancePercent =
    totalClaimed > 0 ? Math.round((initialAttendance.successful_checkins / totalClaimed) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Realtime Status Indicator (FR-REP-02, US-07 #3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Dasbor Operasional Realtime
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pemantauan langsung kuota tiket TERRAFEST dan laju kedatangan di gate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            <Radio className={`h-3 w-3 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
            {isConnected ? 'Realtime Aktif' : 'Polling Aktif'}
          </span>
          <button
            onClick={() => router.refresh()}
            className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Segarkan
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (US-07 #1, #2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Kuota
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-foreground">
              {totalQuota.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Kapasitas seluruh kategori</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tiket Terklaim
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {totalClaimed.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {claimPercent}% terisi
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${claimPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sisa Kuota
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-foreground">
              {totalRemaining.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tiket belum terklaim</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Check-In Berhasil
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {initialAttendance.successful_checkins.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {attendancePercent}% hadir
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${attendancePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Kategori Kuota & Kehadiran Per Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Types Progress */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              Status Kuota per Kategori
            </h2>
            <span className="text-xs text-muted-foreground">
              {initialTicketTypes.length} Kategori
            </span>
          </div>

          <div className="space-y-4">
            {initialTicketTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Belum ada kategori tiket yang dikonfigurasi.
              </p>
            ) : (
              initialTicketTypes.map((type) => {
                const pct =
                  type.quota_total > 0
                    ? Math.round((type.quota_claimed / type.quota_total) * 100)
                    : 0;
                return (
                  <div key={type.id} className="p-3.5 rounded-lg border border-border/70 bg-muted/10 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground">{type.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {type.quota_claimed} / {type.quota_total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          pct >= 100
                            ? 'bg-rose-500'
                            : pct > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rp {type.price_idr.toLocaleString('id-ID')}</span>
                      <span>Sisa: {type.remaining_quota}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gate Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-primary" />
              Kehadiran per Gate
            </h2>
            <span className="text-xs text-muted-foreground">
              {initialAttendance.by_gate.length} Pintu Aktif
            </span>
          </div>

          <div className="space-y-3">
            {initialAttendance.by_gate.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Belum ada gate aktif.
              </p>
            ) : (
              initialAttendance.by_gate.map((g) => {
                const totalScans = initialAttendance.total_checkins || 1;
                const gatePct = Math.round((g.count / totalScans) * 100);
                return (
                  <div
                    key={g.gate_id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-muted/10"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-sm text-foreground">{g.gate_name}</span>
                      <p className="text-xs text-muted-foreground">{gatePct}% dari total scan</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-foreground">{g.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">scan</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Arrival Rate (15 min) & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrival Rate per 15 min (US-07 #2) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              Laju Kedatangan per 15 Menit
            </h2>
            <span className="text-xs text-muted-foreground">WIB</span>
          </div>

          {initialAttendance.arrival_rate_15m.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              Belum ada riwayat pemindaian dalam 15 menit terakhir.
            </p>
          ) : (
            <div className="space-y-2">
              {initialAttendance.arrival_rate_15m.map((rate) => (
                <div key={rate.time_label} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
                  <span className="font-mono text-muted-foreground">{rate.time_label} WIB</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-primary/20 h-2 rounded-full"
                      style={{ width: `${Math.min(rate.count * 10, 150)}px` }}
                    />
                    <span className="font-bold text-foreground">{rate.count} orang</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scan Status Summary */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-base text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Rekap Hasil Scan
            </h2>
            <span className="text-xs text-muted-foreground">
              Total {initialAttendance.total_checkins} Scan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Berhasil Masuk</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {initialAttendance.successful_checkins}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Sudah Dipakai</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {initialAttendance.already_used_count}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Tidak Valid</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {initialAttendance.invalid_token_count}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-muted bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">Dibatalkan</span>
              <p className="text-2xl font-black text-foreground mt-1">
                {initialAttendance.cancelled_count}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

