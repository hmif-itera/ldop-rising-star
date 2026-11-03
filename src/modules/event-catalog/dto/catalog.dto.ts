import { z } from 'zod';

export const CreateArtistSchema = z.object({
  name: z.string().min(2, 'Nama artis minimal 2 karakter'),
  genre: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo_url: z.string().url('URL foto tidak valid').optional().nullable().or(z.literal('')),
  instagram_url: z.string().url('URL Instagram tidak valid').optional().nullable().or(z.literal('')),
  spotify_url: z.string().url('URL Spotify tidak valid').optional().nullable().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type CreateArtistInput = z.infer<typeof CreateArtistSchema>;

export const CreateScheduleSchema = z.object({
  event_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  artist_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => new Date(data.ends_at).getTime() > new Date(data.starts_at).getTime(),
  {
    message: 'Waktu selesai harus lebih besar dari waktu mulai',
    path: ['ends_at'],
  }
);

export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

export const CreateAnnouncementSchema = z.object({
  event_id: z.string().uuid(),
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  body: z.string().min(5, 'Isi pengumuman minimal 5 karakter'),
  is_pinned: z.boolean().default(false),
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;

export interface ArtistDTO {
  id: string;
  name: string;
  genre: string | null;
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  spotify_url: string | null;
  is_active: boolean;
}

export interface VenueDTO {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
}

export interface EventDetailDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  terms: string | null;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
  venue: VenueDTO | null;
}

export interface StageDTO {
  id: string;
  event_id: string;
  name: string;
}

export interface ScheduleItemDTO {
  id: string;
  event_id: string;
  stage_id: string;
  stage_name: string;
  artist_id: string;
  artist_name: string;
  artist_genre: string | null;
  artist_photo_url: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
}

export interface AnnouncementDTO {
  id: string;
  event_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
}
