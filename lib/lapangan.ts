export function isLapanganId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function parseLapanganNama(value: FormDataEntryValue | null) {
  const nama = String(value ?? "").trim();
  return nama.length >= 3 && nama.length <= 100 ? nama : null;
}

export function parseLapanganHarga(value: FormDataEntryValue | null) {
  const harga = Number(value);
  return Number.isInteger(harga) && harga > 0 ? harga : null;
}

function parseOptionalText(value: FormDataEntryValue | null, max: number) {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;

  const text = value.trim();
  if (!text) return null;
  return text.length <= max ? text : undefined;
}

function normalizeGoogleMapsUrl(text: string) {
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;

  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  const isMapsPath = path === "/maps" || path.startsWith("/maps/");
  const allowed =
    (host === "maps.app.goo.gl" && path.length > 1) ||
    (host === "goo.gl" && isMapsPath) ||
    host === "maps.google.com" ||
    host === "maps.google.co.id" ||
    (["google.com", "www.google.com", "google.co.id", "www.google.co.id"].includes(host) && isMapsPath);

  return allowed ? url.href : null;
}

export function parseLapanganLokasi(value: FormDataEntryValue | null) {
  const text = parseOptionalText(value, 500);
  if (!text) return text;

  return normalizeGoogleMapsUrl(text) ?? undefined;
}

export function parseLapanganDeskripsi(value: FormDataEntryValue | null) {
  const text =
    typeof value === "string" ? value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : value;
  return parseOptionalText(text, 2000);
}
