'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface TicketQRProps {
  token: string;
  size?: number;
}

export function TicketQR({ token, size = 200 }: TicketQRProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-white rounded-2xl shadow-sm border border-gray-200">
      <QRCodeSVG
        value={token}
        size={size}
        level="Q" // Error correction level Q per PRD Bab 2.2.5
        includeMargin={true}
      />
      <div className="mt-3 text-center">
        <p className="text-[11px] font-mono tracking-wider text-gray-500 uppercase">
          Token: {token.slice(0, 6)}••••••••{token.slice(-4)}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Tunjukkan kode ini kepada petugas di gate
        </p>
      </div>
    </div>
  );
}
