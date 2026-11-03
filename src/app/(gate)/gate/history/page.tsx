import { attendanceService } from '@/modules/attendance';
import { History, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GateHistoryPage() {
  const logs = await attendanceService.getStaffRecentLogs(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Riwayat Pemindaian Anda</h1>
        <p className="text-xs text-gray-400 mt-1">Daftar hasil scan tiket pada sesi gerbang Anda saat ini.</p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center text-gray-500 space-y-2">
          <History className="mx-auto h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">Belum ada riwayat pemindaian.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          {logs.map((log) => {
            const isSuccess = log.result === 'SUCCESS';
            const isUsed = log.result === 'ALREADY_USED';

            return (
              <div key={log.id} className="p-4 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                  {isUsed && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />}
                  {!isSuccess && !isUsed && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                  <div>
                    <span className="font-bold text-gray-200">
                      {isSuccess ? 'SAH' : isUsed ? 'SUDAH DIPAKAI' : 'DITOLAK'}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {log.gate_name} • ID: {log.id}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-gray-400">
                  {new Date(log.scanned_at).toLocaleTimeString('id-ID')} WIB
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
