'use client';

import * as React from 'react';
import {
  QRScanner,
  ScanResultBanner,
  type VerifyCheckinResultDTO,
  type GateDTO,
} from '@/modules/attendance';
import { Button } from '@/modules/shared';
import { DoorOpen, Keyboard } from 'lucide-react';

export default function GateScanPage() {
  const [gates, setGates] = React.useState<GateDTO[]>([]);
  const [selectedGateId, setSelectedGateId] = React.useState<string>('');
  const [scanResult, setScanResult] = React.useState<VerifyCheckinResultDTO | null>(null);
  const [manualCode, setManualCode] = React.useState('');
  const [showManual, setShowManual] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Muat daftar gate aktif
    fetch('/api/health') // dummy check or load gates via server action or fallback
      .then(() => {
        // Fallback default gates if database empty
        const defaultGates: GateDTO[] = [
          { id: '00000000-0000-0000-0000-0000000000e1', event_id: 'e1', name: 'Gate A (Utama)', is_active: true },
          { id: '00000000-0000-0000-0000-0000000000e2', event_id: 'e1', name: 'Gate B (VIP / Staff)', is_active: true },
        ];
        setGates(defaultGates);
        setSelectedGateId(defaultGates[0].id);
      })
      .catch(() => {});
  }, []);

  const handleVerifyToken = async (token: string) => {
    if (!token || !selectedGateId || loading) return;
    try {
      setLoading(true);
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_token: token,
          gate_id: selectedGateId,
        }),
      });

      const data: VerifyCheckinResultDTO = await res.json();
      setScanResult(data);
    } catch {
      setScanResult({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Gagal terhubung ke server pintu masuk.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerifyToken(manualCode.trim());
      setManualCode('');
      setShowManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sesi Pemilihan Gate (FR-ATT-06) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <DoorOpen className="h-4 w-4 text-emerald-400" />
          <span>Lokasi Gate Aktif</span>
        </label>
        <select
          value={selectedGateId}
          onChange={(e) => setSelectedGateId(e.target.value)}
          className="w-full bg-black border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm font-semibold"
        >
          {gates.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Area Pemindai Kamera (US-06) */}
      {!showManual ? (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-200">Arahkan Kamera ke QR Tiket</h2>
            <p className="text-xs text-gray-500 mt-1">Pemindaian otomatis bekerja secara realtime</p>
          </div>

          <QRScanner
            onScanSuccess={handleVerifyToken}
            disabled={loading || scanResult !== null}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowManual(true)}
            className="w-full border-gray-800 text-gray-300 hover:bg-gray-900 h-10"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Input Token Manual (Darurat)
          </Button>
        </div>
      ) : (
        /* Pengisian Manual Darurat (FR-ATT-11) */
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-200">Input Manual Token Tiket</h3>
            <button
              onClick={() => setShowManual(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Kembali ke Kamera
            </button>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input
              type="text"
              required
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ketik string token tiket..."
              className="w-full bg-black border border-gray-700 text-white font-mono rounded-lg px-3 py-2.5 text-sm"
            />
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 h-11">
              Verifikasi Token
            </Button>
          </form>
        </div>
      )}

      {/* Banner Hasil Verifikasi Layar Penuh (US-07) */}
      <ScanResultBanner
        result={scanResult}
        onDismiss={() => setScanResult(null)}
      />
    </div>
  );
}
