'use client';

import * as React from 'react';
import type { VerifyCheckinResultDTO } from '../dto/attendance.dto';
import { AttendanceResultBannerConfig } from '../domain/checkin-result';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export interface ScanResultBannerProps {
  result: VerifyCheckinResultDTO | null;
  onDismiss: () => void;
}

export function ScanResultBanner({ result, onDismiss }: ScanResultBannerProps) {
  React.useEffect(() => {
    if (!result) return;
    // Otomatis tutup setelah 3 detik per kriteria penerimaan US-07 #5
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);

    return () => clearTimeout(timer);
  }, [result, onDismiss]);

  if (!result) return null;

  const config = AttendanceResultBannerConfig[result.code] || AttendanceResultBannerConfig.INVALID_TOKEN;

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-x-0 bottom-0 z-50 min-h-[45vh] max-h-[85vh] p-6 shadow-2xl flex flex-col justify-between cursor-pointer animate-in slide-in-from-bottom duration-200"
      style={{
        backgroundColor:
          result.code === 'SUCCESS'
            ? '#16a34a' // Green 600
            : result.code === 'ALREADY_USED'
            ? '#d97706' // Amber 600
            : '#dc2626', // Red 600
        color: '#ffffff',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {result.code === 'SUCCESS' && <CheckCircle2 className="h-10 w-10 text-white shrink-0" />}
          {result.code === 'ALREADY_USED' && <AlertTriangle className="h-10 w-10 text-white shrink-0" />}
          {['INVALID_TOKEN', 'CANCELLED', 'UNAUTHORIZED', 'GATE_NOT_FOUND'].includes(result.code) && (
            <XCircle className="h-10 w-10 text-white shrink-0" />
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{config.label}</h2>
            <p className="text-sm font-semibold opacity-90 mt-0.5">{result.message}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Tutup banner"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Ticket Details in Banner */}
      <div className="my-6 p-4 rounded-xl bg-black/25 backdrop-blur-sm space-y-2 text-sm">
        {result.holder_name && (
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span className="opacity-80">Pemegang Tiket:</span>
            <span className="font-extrabold text-base">{result.holder_name}</span>
          </div>
        )}
        {result.ticket_type && (
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span className="opacity-80">Kategori:</span>
            <span className="font-bold">{result.ticket_type}</span>
          </div>
        )}
        {result.gate && (
          <div className="flex justify-between border-b border-white/20 pb-2">
            <span className="opacity-80">Gate:</span>
            <span className="font-bold">{result.gate}</span>
          </div>
        )}
        {result.used_at && (
          <div className="flex justify-between text-amber-100 font-medium">
            <span>Check-in Sebelumnya:</span>
            <span>{new Date(result.used_at).toLocaleTimeString('id-ID')} WIB</span>
          </div>
        )}
      </div>

      <div className="text-center text-xs opacity-75 font-medium">
        Ketuk layar di mana saja untuk menutup dan melanjutkan pemindaian
      </div>
    </div>
  );
}
