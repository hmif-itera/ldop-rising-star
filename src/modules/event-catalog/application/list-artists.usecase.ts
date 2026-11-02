import { CatalogRepository } from '../infrastructure/catalog.repository';
import type { ArtistDTO } from '../dto/catalog.dto';

export async function listArtists(onlyActive = true): Promise<ArtistDTO[]> {
  return CatalogRepository.listArtists(onlyActive);
}
