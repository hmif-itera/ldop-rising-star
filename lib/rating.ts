export const KOMENTAR_MAKS = 2000;

export function isRatingId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function parseRating(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 5
    ? value
    : undefined;
}

export function parseKomentar(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;

  const komentar = value.trim();
  if (!komentar) return null;
  return komentar.length <= KOMENTAR_MAKS ? komentar : undefined;
}

export async function readRatingBody(req: Request) {
  try {
    const body: unknown = await req.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
