import { CatalogRepository } from '../infrastructure/catalog.repository';
import type { EventDetailDTO } from '../dto/catalog.dto';

export async function getActiveEvent(): Promise<EventDetailDTO | null> {
  return CatalogRepository.getActiveEvent();
}

export async function getEventBySlug(slug: string): Promise<EventDetailDTO | null> {
  return CatalogRepository.getEventBySlug(slug);
}
