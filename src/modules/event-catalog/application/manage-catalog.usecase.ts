import { CatalogRepository } from '../infrastructure/catalog.repository';
import { requireRole, writeAuditLog, type Json } from '@/modules/shared';
import {
  CreateArtistSchema,
  CreateAnnouncementSchema,
  type CreateArtistInput,
  type CreateAnnouncementInput,
  type ArtistDTO,
  type AnnouncementDTO,
} from '../dto/catalog.dto';

export async function createArtist(input: CreateArtistInput): Promise<ArtistDTO> {
  await requireRole(['admin']);
  const validated = CreateArtistSchema.parse(input);

  const artist = await CatalogRepository.createArtist(validated);

  await writeAuditLog({
    action: 'ARTIST_CREATED',
    entityType: 'catalog_artists',
    entityId: artist.id,
    newData: artist as unknown as Json,
  });

  return artist;
}

export async function updateArtist(id: string, input: Partial<CreateArtistInput>): Promise<ArtistDTO> {
  await requireRole(['admin']);

  const updated = await CatalogRepository.updateArtist(id, input);

  await writeAuditLog({
    action: 'ARTIST_UPDATED',
    entityType: 'catalog_artists',
    entityId: id,
    newData: updated as unknown as Json,
  });

  return updated;
}

export async function listAnnouncements(eventId: string): Promise<AnnouncementDTO[]> {
  return CatalogRepository.listAnnouncements(eventId);
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<AnnouncementDTO> {
  await requireRole(['admin']);
  const validated = CreateAnnouncementSchema.parse(input);

  const announcement = await CatalogRepository.createAnnouncement(validated);

  await writeAuditLog({
    action: 'ANNOUNCEMENT_CREATED',
    entityType: 'catalog_announcements',
    entityId: announcement.id,
    newData: announcement as unknown as Json,
  });

  return announcement;
}
