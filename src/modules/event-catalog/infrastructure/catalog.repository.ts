import { createServerClient } from '@/modules/shared';
import type {
  ArtistDTO,
  EventDetailDTO,
  StageDTO,
  ScheduleItemDTO,
  AnnouncementDTO,
  CreateArtistInput,
  CreateScheduleInput,
  CreateAnnouncementInput,
} from '../dto/catalog.dto';

interface JoinedEventRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  terms: string | null;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
  catalog_venues: {
    id: string;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    map_url: string | null;
  } | null;
}

interface JoinedScheduleRow {
  id: string;
  event_id: string;
  stage_id: string;
  artist_id: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  catalog_stages: { name: string } | null;
  catalog_artists: { name: string; genre: string | null; photo_url: string | null } | null;
}

export class CatalogRepository {
  static async getActiveEvent(): Promise<EventDetailDTO | null> {
    const supabase = await createServerClient();
    const { data: event, error } = await supabase
      .from('catalog_events')
      .select('*, catalog_venues(*)')
      .eq('is_published', true)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !event) return null;

    const row = event as unknown as JoinedEventRow;
    const venue = row.catalog_venues;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      terms: row.terms,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      is_published: row.is_published,
      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
            address: venue.address,
            latitude: venue.latitude ? Number(venue.latitude) : null,
            longitude: venue.longitude ? Number(venue.longitude) : null,
            map_url: venue.map_url,
          }
        : null,
    };
  }

  static async getEventBySlug(slug: string): Promise<EventDetailDTO | null> {
    const supabase = await createServerClient();
    const { data: event, error } = await supabase
      .from('catalog_events')
      .select('*, catalog_venues(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !event) return null;

    const row = event as unknown as JoinedEventRow;
    const venue = row.catalog_venues;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      terms: row.terms,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      is_published: row.is_published,
      venue: venue
        ? {
            id: venue.id,
            name: venue.name,
            address: venue.address,
            latitude: venue.latitude ? Number(venue.latitude) : null,
            longitude: venue.longitude ? Number(venue.longitude) : null,
            map_url: venue.map_url,
          }
        : null,
    };
  }

  static async listArtists(onlyActive = true): Promise<ArtistDTO[]> {
    const supabase = await createServerClient();
    let query = supabase.from('catalog_artists').select('*').order('name', { ascending: true });

    if (onlyActive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ArtistDTO[];
  }

  static async createArtist(input: CreateArtistInput): Promise<ArtistDTO> {
    const supabase = await createServerClient();
    const payload = {
      name: input.name,
      genre: input.genre || null,
      bio: input.bio || null,
      photo_url: input.photo_url || null,
      instagram_url: input.instagram_url || null,
      spotify_url: input.spotify_url || null,
      is_active: input.is_active,
    };

    const { data, error } = await supabase
      .from('catalog_artists')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Gagal membuat artis: ${error?.message}`);
    }

    return data as ArtistDTO;
  }

  static async updateArtist(id: string, input: Partial<CreateArtistInput>): Promise<ArtistDTO> {
    const supabase = await createServerClient();
    const payload = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.genre !== undefined && { genre: input.genre }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.photo_url !== undefined && { photo_url: input.photo_url }),
      ...(input.instagram_url !== undefined && { instagram_url: input.instagram_url }),
      ...(input.spotify_url !== undefined && { spotify_url: input.spotify_url }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('catalog_artists') as any)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Gagal memperbarui artis: ${error?.message}`);
    }

    return data as ArtistDTO;
  }

  static async listStages(eventId: string): Promise<StageDTO[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('catalog_stages')
      .select('*')
      .eq('event_id', eventId)
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data as StageDTO[];
  }

  static async listSchedules(eventId: string, stageId?: string): Promise<ScheduleItemDTO[]> {
    const supabase = await createServerClient();
    let query = supabase
      .from('catalog_schedules')
      .select(`
        id,
        event_id,
        stage_id,
        artist_id,
        starts_at,
        ends_at,
        notes,
        catalog_stages(name),
        catalog_artists(name, genre, photo_url)
      `)
      .eq('event_id', eventId)
      .is('deleted_at', null)
      .order('starts_at', { ascending: true });

    if (stageId) {
      query = query.eq('stage_id', stageId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const rows = data as unknown as JoinedScheduleRow[];

    return rows.map((item) => ({
      id: item.id,
      event_id: item.event_id,
      stage_id: item.stage_id,
      stage_name: item.catalog_stages?.name ?? 'Panggung',
      artist_id: item.artist_id,
      artist_name: item.catalog_artists?.name ?? 'Artis',
      artist_genre: item.catalog_artists?.genre ?? null,
      artist_photo_url: item.catalog_artists?.photo_url ?? null,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      notes: item.notes,
    }));
  }

  static async findConflictingSchedule(
    stageId: string,
    startsAt: string,
    endsAt: string,
    excludeScheduleId?: string
  ): Promise<boolean> {
    const supabase = await createServerClient();
    let query = supabase
      .from('catalog_schedules')
      .select('id')
      .eq('stage_id', stageId)
      .is('deleted_at', null)
      .lt('starts_at', endsAt)
      .gt('ends_at', startsAt);

    if (excludeScheduleId) {
      query = query.neq('id', excludeScheduleId);
    }

    const { data, error } = await query;
    if (error) return false;
    return !!(data && data.length > 0);
  }

  static async createSchedule(input: CreateScheduleInput): Promise<void> {
    const supabase = await createServerClient();
    const payload = {
      event_id: input.event_id,
      stage_id: input.stage_id,
      artist_id: input.artist_id,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      notes: input.notes || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('catalog_schedules') as any).insert(payload);

    if (error) {
      throw new Error(`Gagal menyimpan sesi jadwal: ${error.message}`);
    }
  }

  static async softDeleteSchedule(scheduleId: string): Promise<void> {
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('catalog_schedules') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Gagal menghapus jadwal: ${error.message}`);
    }
  }

  static async listAnnouncements(eventId: string): Promise<AnnouncementDTO[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('catalog_announcements')
      .select('*')
      .eq('event_id', eventId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as AnnouncementDTO[];
  }

  static async createAnnouncement(input: CreateAnnouncementInput): Promise<AnnouncementDTO> {
    const supabase = await createServerClient();
    const payload = {
      event_id: input.event_id,
      title: input.title,
      body: input.body,
      is_pinned: input.is_pinned,
    };

    const { data, error } = await supabase
      .from('catalog_announcements')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Gagal membuat pengumuman: ${error?.message}`);
    }

    return data as AnnouncementDTO;
  }
}
