import Link from 'next/link';
import { catalogService, LineupCard } from '@/modules/event-catalog';
import { Button } from '@/modules/shared';
import { Calendar, MapPin, Ticket, Bell, Sparkles } from 'lucide-react';

export const revalidate = 60; // Cache and revalidate every 60s (FR-CAT-08)

export default async function HomePage() {
  const event = await catalogService.getActiveEvent();
  const artists = await catalogService.listArtists(true);
  const announcements = event ? await catalogService.listAnnouncements(event.id) : [];

  const featuredArtists = artists.slice(0, 4);

  const formatDateRange = (startsAt: string, endsAt: string) => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${start.toLocaleDateString('id-ID', options)} - ${end.toLocaleDateString('id-ID', options)}`;
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-background text-white pt-24 pb-20 px-4 sm:px-8">
        <div className="container mx-auto text-center max-w-4xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold backdrop-blur-sm animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Festival Musik Tahunan ITERA Terbesar</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {event?.name ?? 'TERRA FESTIVAL ITERA 2026'}
          </h1>

          <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            {event?.description ??
              'Menghubungkan nada, seni, dan energi ribuan civitas akademika serta masyarakat luas di kampus masa depan ITERA.'}
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 pt-4 text-sm font-medium">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>{event ? formatDateRange(event.starts_at, event.ends_at) : '12 Desember 2026'}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{event?.venue?.name ?? 'Lapangan Utama ITERA, Lampung Selatan'}</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-6">
            <Link href="/tickets">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 h-12 shadow-lg shadow-emerald-500/25">
                <Ticket className="h-5 w-5 mr-2" />
                Dapatkan Tiket
              </Button>
            </Link>
            <Link href="/lineup">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                Lihat Line-Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-8 space-y-16">
        {/* Announcements Section (FR-CAT-05) */}
        {announcements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Bell className="h-5 w-5 text-primary" />
              <h2>Pengumuman Resmi Panitia</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-xl border shadow-sm ${
                    ann.is_pinned
                      ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-foreground">{ann.title}</h3>
                    {ann.is_pinned && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                        Penting
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{ann.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground/75">
                    Dipublikasikan: {new Date(ann.published_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Lineup Section (US-02) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Artis & Bintang Tamu</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Penampil terbaik yang siap mengguncang panggung TERRAFEST.
              </p>
            </div>
            <Link href="/lineup">
              <Button variant="outline" size="sm">
                Lihat Semua ({artists.length})
              </Button>
            </Link>
          </div>

          {featuredArtists.length === 0 ? (
            <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
              Line-up resmi akan segera diumumkan oleh panitia.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArtists.map((artist) => (
                <LineupCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </section>

        {/* Venue & Terms (FR-CAT-01, FR-CAT-04) */}
        {event && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl border bg-muted/20">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi & Denah Festival
              </h3>
              <p className="mt-2 text-base font-semibold text-foreground">
                {event.venue?.name ?? 'Kampus ITERA'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {event.venue?.address ?? 'Jl. Terusan Ryacudu, Way Hui, Jati Agung, Lampung Selatan'}
              </p>
              {event.venue?.map_url && (
                <a
                  href={event.venue.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Buka Peta Petunjuk Arah →
                </a>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold">Syarat & Ketentuan Masuk</h3>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.terms ??
                  `1. Tiket digital sah ber-QR wajib ditunjukkan di pintu gerbang.\n2. Satu tiket hanya berlaku untuk satu orang penonton.\n3. Dilarang membawa senjata tajam, obat-obatan terlarang, dan minuman beralkohol.\n4. Menjaga ketertiban dan fasilitas lingkungan kampus ITERA.`}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
