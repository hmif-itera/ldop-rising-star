'use client';

import * as React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  disabled?: boolean;
}

export function QRScanner({ onScanSuccess, disabled = false }: QRScannerProps) {
  const [scannerError, setScannerError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const lastScannedRef = React.useRef<{ text: string; time: number } | null>(null);
  const scannerInstanceRef = React.useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const scanner = new Html5Qrcode('qr-reader-container');
        scannerInstanceRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // Default kamera belakang (US-06 #1)
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            const now = Date.now();
            // FR-ATT-10: Debounce mechanism (jeda 2000ms antar scan token sama)
            if (
              lastScannedRef.current &&
              lastScannedRef.current.text === decodedText &&
              now - lastScannedRef.current.time < 2000
            ) {
              return;
            }

            lastScannedRef.current = { text: decodedText, time: now };
            onScanSuccess(decodedText);
          },
          () => {
            // Ignore frame scan failures (expected when QR is not in frame)
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Kamera tidak dapat diakses atau izin ditolak.';
          setScannerError(msg);
        }
      }
    }

    if (!disabled) {
      initScanner();
    }

    return () => {
      isMounted = false;
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            try {
              scannerInstanceRef.current?.clear();
            } catch {}
          });
      }
    };
  }, [disabled, onScanSuccess]);

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black shadow-lg">
      <div id="qr-reader-container" className="w-full aspect-square relative" />

      {scannerError && (
        <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-sm font-semibold">{scannerError}</p>
          <p className="text-xs text-gray-400 mt-2">
            Pastikan memberikan izin akses kamera pada peramban (HTTPS).
          </p>
        </div>
      )}

      {!isScanning && !scannerError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60">
          <Camera className="h-8 w-8 text-primary animate-pulse mb-2" />
          <p className="text-xs">Mengaktifkan kamera pemindai...</p>
        </div>
      )}
    </div>
  );
}
