'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Ticket, Menu, X, ArrowUpRight } from 'lucide-react';

export function FloatingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Line Up', href: '/lineup' },
    { label: 'Jadwal', href: '/schedule' },
    { label: 'Pengalaman', href: '/#experience' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      {/* Floating macOS / iOS Island Header */}
      <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto ios-pill-dock ios-blur rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300">
          
          {/* Left: macOS Traffic Lights + Brand Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* macOS Traffic Dots (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-border/60">
              <span className="traffic-dot traffic-dot-close" title="Close" />
              <span className="traffic-dot traffic-dot-minimize" title="Minimize" />
              <span className="traffic-dot traffic-dot-maximize" title="Maximize" />
            </div>

            {/* Apple Squircle Brand Icon */}
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                TERRAFEST
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  &apos;26
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block -mt-1 font-medium">
                Terra Festival ITERA
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/40">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: iOS Action Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/tickets">
              <button className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Ticket className="h-3.5 w-3.5" />
                <span>Klaim Tiket</span>
              </button>
            </Link>

            <Link href="/login" className="hidden sm:inline-flex">
              <button className="px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium text-foreground bg-secondary/80 hover:bg-secondary border border-border/60 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Masuk
              </button>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-full text-foreground hover:bg-muted/80 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Control Center Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden max-w-5xl mx-auto mt-2 pointer-events-auto ios-glass-card ios-blur rounded-3xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs font-semibold text-muted-foreground">
              <span>MENU UTAMA</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Online • ITERA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-background/60 hover:bg-background border border-border/40 text-sm font-medium transition-all"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                </Link>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-border/50 flex flex-col gap-2">
              <Link
                href="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
              >
                <Ticket className="h-3.5 w-3.5" />
                Lihat E-Tiket Saya
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-muted/60 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
              >
                Masuk Akun Google ITERA
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
