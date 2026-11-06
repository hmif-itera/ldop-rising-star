import * as React from 'react';
import Link from 'next/link';
import { FloatingNavbar } from './components/floating-navbar';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 relative overflow-x-hidden">
      {/* Ambient iOS Background Mesh Gradient Lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl opacity-75 dark:opacity-40" />
        <div className="absolute top-[35%] -left-48 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-50 dark:opacity-20" />
        <div className="absolute top-[65%] -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50 dark:opacity-20" />
      </div>

      {/* Floating Apple-Style Navigation Island */}
      <FloatingNavbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 sm:pt-24">{children}</main>

      {/* Apple-Style Minimalist Frosted Footer */}
      <footer className="border-t border-border/40 bg-background/60 ios-blur mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-border/50">
            {/* Col 1: Brand & Identity */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  TERRAFEST 2026
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Platform Festival Musik & Seni Tahunan Institut Teknologi Sumatera (ITERA).
                Dikelola oleh Kelompok 3 untuk Challenge Pembuatan Website Kaderisasi HMIF ITERA.
              </p>
              
              {/* System Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Seluruh Sistem Normal • Supabase Realtime Connected</span>
              </div>
            </div>

            {/* Col 2: Navigasi Cepat */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Navigasi Cepat
              </h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-emerald-600 transition-colors">
                    Beranda Festival
                  </Link>
                </li>
                <li>
                  <Link href="/lineup" className="hover:text-emerald-600 transition-colors">
                    Line Up Penampil
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:text-emerald-600 transition-colors">
                    Jadwal Panggung & Rundown
                  </Link>
                </li>
                <li>
                  <Link href="/tickets" className="hover:text-emerald-600 transition-colors">
                    Klaim Tiket Penonton
                  </Link>
                </li>
                <li>
                  <Link href="/my-tickets" className="hover:text-emerald-600 transition-colors">
                    E-Tiket Digital Saya
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Portal Staf & Panitia */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Portal Internal
              </h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/gate/scan" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                    <span>Pemindai Gerbang (Gate Scanner)</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                    <span>Dasbor Realtime Admin</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-600 transition-colors">
                    Login Akun Google ITERA
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/hmif-itera/ldop-rising-star"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <span>HMIF ITERA GitHub</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Credit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              © 2026 <strong>Kelompok 3 — TerraFest</strong>. Institut Teknologi Sumatera (ITERA).
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                Didesain dengan gaya <span className="font-semibold text-foreground">iOS / macOS</span>
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                LDOP Rising Star
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
