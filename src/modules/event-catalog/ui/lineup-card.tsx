/* eslint-disable @next/next/no-img-element */
import React from 'react';
import type { ArtistDTO } from '../dto/catalog.dto';
import { Music, Instagram } from 'lucide-react';

export interface LineupCardProps {
  artist: ArtistDTO;
}

export function LineupCard({ artist }: LineupCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
        {artist.photo_url ? (
          <img
            src={artist.photo_url}
            alt={artist.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
            <Music className="h-16 w-16 opacity-40" />
          </div>
        )}
        {artist.genre && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {artist.genre}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {artist.name}
        </h3>
        {artist.bio && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {artist.bio}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 pt-3 border-t border-border/60 text-muted-foreground">
          {artist.instagram_url && (
            <a
              href={artist.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${artist.name}`}
              className="hover:text-pink-600 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {artist.spotify_url && (
            <a
              href={artist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Spotify ${artist.name}`}
              className="hover:text-green-500 transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.674.464-1.027.248-2.812-1.718-6.352-2.107-10.522-1.155-.403.093-.805-.16-.897-.562-.093-.404.16-.806.562-.898 4.567-1.042 8.49-.603 11.636 1.34.353.216.464.675.248 1.027zm1.464-3.255c-.27.44-.847.58-1.287.31-3.218-1.977-8.124-2.55-11.93-1.393-.496.15-1.023-.135-1.173-.631-.15-.497.135-1.024.631-1.174 4.353-1.321 9.774-.683 13.45 1.578.44.27.58.847.31 1.31zm.126-3.385c-3.858-2.29-10.222-2.502-13.896-1.387-.59.18-1.22-.16-1.399-.75-.18-.59.16-1.22.75-1.399 4.225-1.282 11.258-1.037 15.688 1.593.53.315.703 1.006.388 1.536-.314.53-1.006.703-1.536.388z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
