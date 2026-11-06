export interface EventEntity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  terms: string | null;
  venueId: string | null;
  startsAt: Date;
  endsAt: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueEntity {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
}

export function validateEventDates(startsAt: Date, endsAt: Date): boolean {
  return endsAt.getTime() > startsAt.getTime();
}
