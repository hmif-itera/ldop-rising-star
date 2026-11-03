'use server';

import { revalidatePath } from 'next/cache';
import {
  catalogService,
  CreateArtistSchema,
  CreateScheduleSchema,
  CreateAnnouncementSchema,
} from '@/modules/event-catalog';

export async function createArtistAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = {
      name: formData.get('name') as string,
      genre: (formData.get('genre') as string) || null,
      bio: (formData.get('bio') as string) || null,
      photo_url: (formData.get('photo_url') as string) || null,
      instagram_url: (formData.get('instagram_url') as string) || null,
      spotify_url: (formData.get('spotify_url') as string) || null,
      is_active: formData.get('is_active') === 'on',
    };

    const validated = CreateArtistSchema.parse(raw);
    await catalogService.createArtist(validated);

    revalidatePath('/lineup');
    revalidatePath('/');
    return { success: true, message: 'Artis berhasil ditambahkan.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan artis.';
    return { success: false, message };
  }
}

export async function createScheduleAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = {
      event_id: formData.get('event_id') as string,
      stage_id: formData.get('stage_id') as string,
      artist_id: formData.get('artist_id') as string,
      starts_at: formData.get('starts_at') as string,
      ends_at: formData.get('ends_at') as string,
      notes: (formData.get('notes') as string) || null,
    };

    const validated = CreateScheduleSchema.parse(raw);
    await catalogService.createScheduleSession(validated);

    revalidatePath('/schedule');
    revalidatePath('/');
    return { success: true, message: 'Sesi jadwal penampil berhasil dibuat.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan sesi jadwal.';
    return { success: false, message };
  }
}

export async function deleteScheduleAction(scheduleId: string) {
  try {
    await catalogService.deleteScheduleSession(scheduleId);
    revalidatePath('/schedule');
    revalidatePath('/');
    return { success: true, message: 'Jadwal berhasil dihapus.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus jadwal.';
    return { success: false, message };
  }
}

export async function createAnnouncementAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = {
      event_id: formData.get('event_id') as string,
      title: formData.get('title') as string,
      body: formData.get('body') as string,
      is_pinned: formData.get('is_pinned') === 'on',
    };

    const validated = CreateAnnouncementSchema.parse(raw);
    await catalogService.createAnnouncement(validated);

    revalidatePath('/');
    return { success: true, message: 'Pengumuman resmi berhasil diterbitkan.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membuat pengumuman.';
    return { success: false, message };
  }
}
