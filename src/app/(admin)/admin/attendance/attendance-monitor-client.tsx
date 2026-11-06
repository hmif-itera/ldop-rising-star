'use client';

import * as React from 'react';
import type { GateDTO, AdminAttendanceMetricDTO } from '@/modules/attendance';
import {
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DoorOpen,
  Calendar,
} from 'lucide-react';

interface AttendanceMonitorClientProps {
  gates: GateDTO[];
  initialMetrics: AdminAttendanceMetricDTO;
}

export function AttendanceMonitorClient({
  gates,
  initialMetrics,
}: AttendanceMonitorClientProps) {
  // Export filters (US-14 #1)
  const [selectedGate, setSelectedGate] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [resultFilter, setResultFilter] = React.useState<string>('');
  const [isExporting, setIsExporting] = React.useState(false);

  function handleDownloadCSV() {
    setIsExporting(true);
    const params = new URLSearchParams();
    if (selectedGate) params.set('gate_id', selectedGate);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (resultFilter) params.set('result', resultFilter);

    const url = `/api/admin/export-attendance?${params.toString()}`;
    window.location.href = url;
    setTimeout(() => setIsExporting(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Monitor Kehadiran & Rekonsiliasi Gate
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pantau pemindaian langsung di lapangan dan unduh rekap data kehadiran (CSV).
        </p>
      </div>

      {/* Export CSV Panel (US-14) */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">
              Ekspor Data Kehadiran (CSV)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">UTF-8 Encoded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <DoorOpen className="h-3.5 w-3.5" /> Pintu / Gate
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Pintu Gate</option>
              {gates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Status Hasil
            </label>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Semua Status</option>
              <option value="SUCCESS">SUCCESS (Berhasil Masuk)</option>
              <option value="ALREADY_USED">ALREADY_USED (Tiket Pernah Dipakai)</option>
              <option value="INVALID_TOKEN">INVALID_TOKEN (Token Palsu / Tidak Valid)</option>
              <option value="CANCELLED">CANCELLED (Tiket Dibatalkan)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Mulai Dari
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Hingga Sampai
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-muted/30 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Menyiapkan CSV...' : 'Unduh Berkas CSV'}
          </button>
        </div>
      </div>

      {/* Gate Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {initialMetrics.by_gate.map((g) => (
          <div key={g.gate_id} className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase">{g.gate_name}</span>
              <DoorOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">{g.count}</span>
              <span className="text-xs text-muted-foreground">pengunjung</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Live Logs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Aktivitas Pemindaian Terkini ({initialMetrics.recent_logs.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Total {initialMetrics.total_checkins} rekaman log
          </span>
        </div>

        {initialMetrics.recent_logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Belum ada aktivitas pemindaian yang tercatat di gate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-3">Waktu Scan (WIB)</th>
                  <th className="p-3">Gate</th>
                  <th className="p-3">Hasil Pemindaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {initialMetrics.recent_logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">
                      {new Date(log.scanned_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{log.gate_name}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : log.result === 'ALREADY_USED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {log.result === 'SUCCESS' && <CheckCircle2 className="h-3 w-3" />}
                        {log.result === 'ALREADY_USED' && <Clock className="h-3 w-3" />}
                        {(log.result === 'INVALID_TOKEN' || log.result === 'CANCELLED') && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

