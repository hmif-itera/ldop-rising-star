'use client';

import * as React from 'react';
import Link from 'next/link';
import { QrCode, ShieldCheck, Ticket, CheckCircle2 } from 'lucide-react';

export function AppleWalletPreview() {
  return (
    <div className="relative group max-w-sm mx-auto w-full">
      {/* Ambient iOS Glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-emerald-400/30 rounded-[2.5rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />

      {/* Apple Wallet Pass Container */}
      <div className="relative rounded-[2rem] bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white p-6 shadow-2xl border border-white/15 overflow-hidden font-sans">
        
        {/* Specular Highlight Sheen */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Pass Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-black text-xs shadow-md shadow-emerald-500/40">
              TF
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-bold block">
                TERRAFEST ITERA
              </span>
              <span className="text-xs font-semibold text-white/90">EVENT PASS 2026</span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/10">
            FESTIVAL
          </span>
        </div>

        {/* Main Event Headline */}
        <div className="py-4 space-y-1 relative z-10">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Acara</span>
          <h4 className="text-lg font-black tracking-tight text-white leading-tight">
            TERRA FESTIVAL 2026
          </h4>
          <p className="text-xs text-emerald-300/90 font-medium">
            Lapangan Utama Kampus ITERA, Lampung Selatan
          </p>
        </div>

        {/* Info Grid (Apple Pass Fields) */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/10 text-xs relative z-10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-semibold">TANGGAL</span>
            <span className="font-bold text-white text-xs">12 DES 2026</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-semibold">OPEN GATE</span>
            <span className="font-bold text-emerald-400 text-xs">10:00 WIB</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-semibold">STATUS</span>
            <span className="font-bold text-emerald-300 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="h-3 w-3" /> SAH
            </span>
          </div>
        </div>

        {/* Notched Barcode / QR Simulation */}
        <div className="pt-5 pb-2 flex flex-col items-center justify-center text-center relative z-10 space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-inner text-zinc-950 flex flex-col items-center">
            {/* Visual High-Tech QR simulation */}
            <div className="h-28 w-28 bg-zinc-900 rounded-xl flex items-center justify-center text-white p-2">
              <QrCode className="h-20 w-20 text-emerald-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 mt-2 font-bold">
              TF26-9BFA5B2C-GATE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Kriptografi SHA-256 Anti Double-Entry</span>
          </div>
        </div>

        {/* Action Button inside pass */}
        <div className="pt-3 relative z-10">
          <Link href="/tickets">
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" />
              Klaim E-Tiket Kamu Sekarang
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
