import Link from 'next/link';
import { requireRole } from '@/modules/shared';
import { QrCode, History, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(['gate_staff', 'admin']);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* High contrast Gate Staff Header */}
      <header className="border-b border-gray-800 bg-black/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-emerald-400">GATE PASS</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
            {profile.full_name ?? profile.email}
          </span>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/gate/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan</span>
          </Link>
          <Link
            href="/gate/history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <History className="h-4 w-4" />
            <span>Riwayat</span>
          </Link>
          <Link
            href="/"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white"
            title="Keluar ke web publik"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">{children}</main>
    </div>
  );
}
