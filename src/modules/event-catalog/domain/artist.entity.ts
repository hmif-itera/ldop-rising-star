export interface ArtistEntity {
  id: string;
  name: string;
  genre: string | null;
  bio: string | null;
  photoUrl: string | null;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleEntity {
  id: string;
  eventId: string;
  stageId: string;
  artistId: string;
  startsAt: Date;
  endsAt: Date;
  notes: string | null;
  deletedAt: Date | null;
}

export function isTimeOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

export function validateSchedulePeriod(startsAt: Date, endsAt: Date): boolean {
  return endsAt.getTime() > startsAt.getTime();
}
