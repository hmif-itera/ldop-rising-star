/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Link from 'next/link';
import { catalogService, LineupCard } from '@/modules/event-catalog';
import { EventCountdown } from './components/event-countdown';
import { AppleWalletPreview } from './components/apple-wallet-preview';
import { SchedulePreviewTabs } from './components/schedule-preview-tabs';
import { FAQAccordion } from './components/faq-accordion';
import {
  Calendar,
  MapPin,
  Ticket,
  Bell,
  Sparkles,
  ArrowRight,
  Music2,
  ShieldCheck,
  Zap,
  Coffee,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import type { ArtistDTO } from '@/modules/event-catalog';

export const revalidate = 60; // Cache and revalidate every 60s (FR-CAT-08)

// Fallback high-profile festival artists if database table is not yet seeded
const FALLBACK_FEATURED_ARTISTS: ArtistDTO[] = [
  {
    id: 'f-1',
    name: 'Hindia',
    genre: 'Indie Rock / Pop',
    bio: 'Menghadirkan repertoar Menari Dengan Bayangan & Lagipula Hidup Akan Berakhir untuk panggung utama TerraFest.',
    photo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    instagram_url: 'https://instagram.com',
    spotify_url: 'https://spotify.com',
    is_active: true,
  },
  {
    id: 'f-2',
    name: 'Nadin Amizah',
    genre: 'Folk / Pop',
    bio: 'Suara lembut dan puisi nada khas Nadin Amizah siap menemani senja di kampus masa depan ITERA.',
    photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    instagram_url: 'https://instagram.com',
    spotify_url: 'https://spotify.com',
    is_active: true,
  },
  {
    id: 'f-3',
    name: '.Feast',
    genre: 'Alternative Rock',
    bio: 'Energi distorsi penuh kritik sosial dan hentakan drum yang membakar semangat mahasiswa di panggung festival.',
    photo_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=800&q=80',
    instagram_url: 'https://instagram.com',
    spotify_url: 'https://spotify.com',
    is_active: true,
  },
  {
    id: 'f-4',
    name: 'ITERA Symphony Orchestra',
    genre: 'Classical / Symphonic',
    bio: 'Harmoni megah orkestra dan paduan suara civitas akademika ITERA membuka perhelatan akbar TerraFest.',
    photo_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    instagram_url: 'https://instagram.com',
    spotify_url: 'https://spotify.com',
    is_active: true,
  },
];

export default async function HomePage() {
  const event = await catalogService.getActiveEvent();
  const artists = await catalogService.listArtists(true);
  const schedules = event ? await catalogService.getSchedule(event.id) : [];
  const announcements = event ? await catalogService.listAnnouncements(event.id) : [];

  // Use real artists from DB if available, otherwise use curated fallbacks
  const displayArtists = artists.length > 0 ? artists.slice(0, 4) : FALLBACK_FEATURED_ARTISTS;

  const formatDateRange = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${start.toLocaleDateString('id-ID', options)} - ${end.toLocaleDateString('id-ID', options)}`;
  };

  return (
    <div className="space-y-20 pb-24">
      {/* ========================================================================= */}
      {/* SECTION 1: macOS / iOS HERO STAGE WINDOW                                  */}
      {/* ========================================================================= */}
      <section className="relative px-3 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* macOS App / Stage Window Container */}
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] ios-glass-card ios-blur p-6 sm:p-12 shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden text-center space-y-8">
            
            {/* macOS Window Top Chrome (Traffic Lights + Title) */}
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <span className="traffic-dot traffic-dot-close" />
                <span className="traffic-dot traffic-dot-minimize" />
                <span className="traffic-dot traffic-dot-maximize" />
                <span className="text-[11px] font-mono text-muted-foreground ml-2 hidden sm:inline">
                  terrafest.itera.ac.id — Stage v2.6
                </span>
              </div>

              {/* Dynamic Island Countdown capsule */}
              <EventCountdown targetDate={event?.starts_at ?? '2026-12-12T10:00:00+07:00'} />

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Tiket Tersedia</span>
              </div>
            </div>

            {/* Hero Main Content */}
            <div className="space-y-5 max-w-3xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>FESTIVAL MUSIK, SENI & TEKNOLOGI KAMPUS ITERA</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
                TERRA FESTIVAL{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                  2026
                </span>
              </h1>

              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
                {event?.description ??
                  'Menghubungkan nada, seni, dan energi ribuan mahasiswa serta masyarakat di panggung perhelatan akbar kampus masa depan ITERA.'}
              </p>
            </div>

            {/* Quick Info Badges (iOS Widget style) */}
            <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/70 border border-border/50 text-xs font-medium text-foreground">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{event ? formatDateRange(event.starts_at, event.ends_at) : '12 Desember 2026'}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/70 border border-border/50 text-xs font-medium text-foreground">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{event?.venue?.name ?? 'Lapangan Utama Kampus ITERA'}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/70 border border-border/50 text-xs font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verifikasi QR • Bebas Double-Entry</span>
              </div>
            </div>

            {/* Call to Actions (iOS-style Buttons) */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4">
              <Link href="/tickets">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Ticket className="h-4 w-4" />
                  <span>Dapatkan Tiket Masuk</span>
                  <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
                </button>
              </Link>

              <Link href="/lineup">
                <button className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-secondary/90 hover:bg-secondary text-foreground font-semibold text-sm border border-border/60 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Music2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Lihat Bintang Tamu</span>
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ANNOUNCEMENTS SECTION (If pinned/published by committee)                  */}
      {/* ========================================================================= */}
      {announcements.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2>Pengumuman Resmi Panitia</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 rounded-3xl ios-glass-card ios-blur border border-white/20 dark:border-white/10 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-foreground">{ann.title}</h3>
                    {ann.is_pinned && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Penting
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{ann.body}</p>
                  <p className="mt-3 text-[10px] text-muted-foreground/75 font-mono">
                    {new Date(ann.published_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: APPLE BENTO GRID (Festival Experience)                         */}
      {/* ========================================================================= */}
      <section id="experience" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            PENGALAMAN FESTIVAL
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Semua yang Kamu Butuhkan di TerraFest
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Dirancang dengan ekosistem modern yang memanjakan penonton dari awal hingga akhir acara.
          </p>
        </div>

        {/* Bento Grid Layout (Apple-style 4-card arrangement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Bento 1: Dua Panggung (Span 2 Cols) */}
          <div className="md:col-span-2 rounded-[2rem] ios-glass-card ios-blur p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-3 relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Music2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                2 Panggung Terpisah, Tanpa Jadwal Bentrok
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                Nikmati pertunjukan spektakuler di <strong>Terra Main Stage</strong> dan suasana intim di{' '}
                <strong>Nebula Stage</strong>. Jadwal telah divalidasi sistem agar penampilan artis tidak tumpang tindih.
              </p>
            </div>

            <div className="pt-6 flex items-center gap-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Terra Main Stage</span>
              <span className="text-muted-foreground">•</span>
              <span>Nebula Stage</span>
              <span className="text-muted-foreground">•</span>
              <span>Sound System 60.000 Watt</span>
            </div>
          </div>

          {/* Bento 2: Digital E-Ticket & Pass */}
          <div className="rounded-[2rem] ios-glass-card ios-blur p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-lg flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Ticket className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                E-Tiket Digital Langsung di HP
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tanpa antre penukaran tiket fisik. Cukup tunjukkan kode QR dinamis langsung dari layar smartphone Anda.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span>Simpan & Tunjukkan Instan</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          </div>

          {/* Bento 3: Gerbang Masuk Cepat & Kriptografi */}
          <div className="rounded-[2rem] ios-glass-card ios-blur p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-lg flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Scan Gerbang &lt;1 Detik
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pemindai kamera panitia dilengkapi perlindungan SHA-256 Anti Double-Entry. Satu tiket hanya bisa masuk satu kali.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verifikasi Gerbang Otomatis</span>
            </div>
          </div>

          {/* Bento 4: Area Kampus Hijau & Bazar Mahasiswa (Span 2 Cols) */}
          <div className="md:col-span-2 rounded-[2rem] ios-glass-card ios-blur p-6 sm:p-8 border border-white/20 dark:border-white/10 shadow-lg flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coffee className="h-5 w-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Bazar Kuliner, Instalasi Seni & Green Campus
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
                Jelajahi puluhan stan kuliner UMKM mahasiswa ITERA, spot foto estetis instalasi seni arsitektur, dan area santai rindang di kawasan kampus masa depan ITERA.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              <span>🍔 40+ Stan Kuliner</span>
              <span>🎨 Galeri Seni Mahasiswa</span>
              <span>💧 Free Water Refill Station</span>
              <span>🚑 Posko Medis Siaga</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: LINEUP / BINTANG TAMU (Apple Music Style)                      */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              GUEST STARS & PERFORMERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Line Up Bintang Tamu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Musisi dan penampil terbaik siap mengguncang panggung TerraFest 2026.
            </p>
          </div>

          <Link href="/lineup">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-all">
              <span>Lihat Semua Penampil ({artists.length > 0 ? artists.length : displayArtists.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Artist Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayArtists.map((artist) => (
            <LineupCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: JADWAL & RUNDOWN PANGGUNG (iOS Calendar Style)                 */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            TIMELINE & STAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Jadwal Penampilan Panggung
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pilih panggung favoritmu untuk melihat urutan artis dan jam penampilan.
          </p>
        </div>

        <SchedulePreviewTabs schedules={schedules} />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: APPLE WALLET PASS INTERACTIVE SHOWCASE                         */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-[2.5rem] bg-gradient-to-b from-emerald-950/40 via-zinc-900/60 to-background border border-emerald-500/20 ios-blur p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Text description */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                <Ticket className="h-3.5 w-3.5" />
                <span>SMART EVENT PASS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Pengalaman Tiket Digital Seperti di Apple Wallet
              </h2>

              <p className="text-sm text-zinc-300 leading-relaxed">
                Setiap tiket yang diklaim secara otomatis menghasilkan e-pass interaktif dengan kode QR kriptografis.
                Tersimpan aman di akun Anda dan dapat dibuka kapan saja tanpa khawatir tiket tercecer.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Klaim tiket instan dengan akun Google ITERA</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Kode QR token kriptografis 128-bit unik anti pemalsuan</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span>Verifikasi gerbang instan tanpa perlu mencetak kertas</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/tickets">
                  <button className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all">
                    Klaim Tiket Festival Gratis Sekarang →
                  </button>
                </Link>
              </div>
            </div>

            {/* Apple Wallet Visual Pass Component */}
            <div className="flex justify-center">
              <AppleWalletPreview />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDION (iOS Settings Style)                             */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            PERTANYAAN UMUM
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Informasi penting seputar tiket, gerbang masuk, dan peraturan festival.
          </p>
        </div>

        <FAQAccordion />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: VENUE MAP & LOCATION                                           */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-[2rem] ios-glass-card ios-blur p-6 sm:p-10 border border-white/20 dark:border-white/10 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-4 w-4" />
              <span>LOKASI FESTIVAL</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {event?.venue?.name ?? 'Lapangan Utama Kampus ITERA'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {event?.venue?.address ??
                'Jl. Terusan Ryacudu, Way Hui, Kec. Jati Agung, Kabupaten Lampung Selatan, Lampung 35365.'}
            </p>
            <div className="pt-2">
              <a
                href={
                  event?.venue?.map_url ??
                  'https://maps.google.com/?q=Institut+Teknologi+Sumatera'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border/50 transition-colors"
              >
                <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Buka Petunjuk Arah di Google Maps</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 p-5 border border-border/50 space-y-3">
            <h4 className="text-sm font-bold text-foreground">Syarat & Tata Tertib Masuk</h4>
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {event?.terms ??
                `1. Wajib menunjukkan e-tiket sah ber-QR dari smartphone di pintu gerbang.
2. Satu e-tiket hanya berlaku untuk satu orang penonton.
3. Dilarang membawa senjata tajam, miras, dan zat terlarang.
4. Menjaga kebersihan dan ketertiban lingkungan kampus ITERA.`}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: SPONSORS & PARTNERS (macOS Floating Dock Style)                */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          DIDUKUNG OLEH & MITRA KAMPUS
        </span>

        {/* macOS Floating Dock for Partner Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 sm:px-10 py-4 rounded-3xl sm:rounded-full ios-pill-dock ios-blur shadow-xl border border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
              IT
            </div>
            <span>ITERA</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
              IF
            </div>
            <span>HMIF ITERA</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
              RS
            </div>
            <span>LDOP Rising Star</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="h-6 w-6 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black">
              TF
            </div>
            <span>TerraFest Media</span>
          </div>
        </div>
      </section>
    </div>
  );
}
