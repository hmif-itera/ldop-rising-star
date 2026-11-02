import { catalogService, LineupCard } from '@/modules/event-catalog';
import { Music } from 'lucide-react';

export const revalidate = 60; // FR-CAT-08

export default async function LineupPage() {
  const artists = await catalogService.listArtists(true);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Music className="h-3.5 w-3.5" />
          <span>Line-Up Resmi</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Artis & Penampil</h1>
        <p className="mt-3 text-muted-foreground text-base leading-relaxed">
          Temukan jajaran musisi, band kampus, dan bintang tamu nasional yang akan meramaikan Terra Festival ITERA 2026.
        </p>
      </div>

      {artists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-16 text-center text-muted-foreground">
          <Music className="mx-auto h-12 w-12 opacity-30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">Daftar Penampil Segera Hadir</h3>
          <p className="mt-1 text-sm">Panitia sedang memfinalisasi konfirmasi artis penampil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <LineupCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
