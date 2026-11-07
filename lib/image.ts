import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { imageUrl, uploadImage } from "@/lib/r2";

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ImageError";
    this.status = status;
  }
}

export function isFilled(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function addImageUrl<T extends { gambar: string | null }>(item: T) {
  return { ...item, gambarUrl: item.gambar ? imageUrl(item.gambar) : null };
}


export async function processAndUploadImage(file: File, folder = "lapangan") {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new ImageError("Ukuran gambar maksimal 2 MB.", 413);
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ImageError("Format gambar harus JPG, PNG, atau WebP.", 415);
  }

  let output: Buffer;
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1600, 900, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new ImageError("File bukan gambar yang valid.", 400);
  }

  const key = `${folder}/${randomUUID()}.webp`;
  try {
    await uploadImage(key, output);
  } catch {
    throw new ImageError("Gagal mengunggah gambar. Coba lagi.", 502);
  }

  return key;
}
