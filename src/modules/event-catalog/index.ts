/**
 * EventCatalog Module - Public Service Interface
 * Single official entry point for catalog domain logic and presentation.
 */

// Use cases
export { getActiveEvent, getEventBySlug } from './application/get-event.usecase';
export { listArtists } from './application/list-artists.usecase';
export {
  getSchedule,
  listStages,
  createScheduleSession,
  deleteScheduleSession,
} from './application/schedule.usecase';
export {
  createArtist,
  updateArtist,
  listAnnouncements,
  createAnnouncement,
} from './application/manage-catalog.usecase';

// DTOs & Validation Schemas
export {
  CreateArtistSchema,
  CreateScheduleSchema,
  CreateAnnouncementSchema,
  type CreateArtistInput,
  type CreateScheduleInput,
  type CreateAnnouncementInput,
  type ArtistDTO,
  type VenueDTO,
  type EventDetailDTO,
  type StageDTO,
  type ScheduleItemDTO,
  type AnnouncementDTO,
} from './dto/catalog.dto';

// UI Components
export { LineupCard, type LineupCardProps } from './ui/lineup-card';
export { ScheduleTable, type ScheduleTableProps } from './ui/schedule-table';

// Public Service Facade
import { getActiveEvent, getEventBySlug } from './application/get-event.usecase';
import { listArtists } from './application/list-artists.usecase';
import { getSchedule, listStages, createScheduleSession, deleteScheduleSession } from './application/schedule.usecase';
import { createArtist, updateArtist, listAnnouncements, createAnnouncement } from './application/manage-catalog.usecase';

export const catalogService = {
  getActiveEvent,
  getEventBySlug,
  listArtists,
  getSchedule,
  listStages,
  createScheduleSession,
  deleteScheduleSession,
  createArtist,
  updateArtist,
  listAnnouncements,
  createAnnouncement,
};
