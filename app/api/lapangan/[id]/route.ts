import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/r2";
import { addImageUrl, ImageError, isFilled, processAndUploadImage } from "@/lib/image";
import {
  isLapanganId,
  parseLapanganDeskripsi,
  parseLapanganHarga,
  parseLapanganLokasi,
  parseLapanganNama,
} from "@/lib/lapangan";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lapangan/:id - Mengambil detail lapangan beserta URL gambarnya. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isLapanganId(id)) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  const lapangan = await prisma.lapangan.findUnique({ where: { id } });
  if (!lapangan) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(addImageUrl(lapangan));
}

/** PUT/PATCH /api/lapangan/:id - Memperbarui data dan gambar lapangan. */
async function update(req: Request, { params }: Ctx, partial: boolean) {
  const { response } = await requireApiUser(["ADMIN"]);
  if (response) return response;

  const { id } = await params;
  if (!isLapanganId(id)) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Request harus berupa multipart/form-data." }, { status: 400 });
  }

  const existing = await prisma.lapangan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  const data: {
    nama?: string;
    harga?: number;
    aktif?: boolean;
    lokasi?: string | null;
    deskripsi?: string | null;
    gambar?: string | null;
  } = {};

  if (!partial || form.has("nama")) {
    const nama = parseLapanganNama(form.get("nama"));
    if (!nama) return NextResponse.json({ message: "Nama lapangan harus 3–100 karakter." }, { status: 400 });
    data.nama = nama;
  }
  if (!partial || form.has("harga")) {
    const harga = parseLapanganHarga(form.get("harga"));
    if (!harga) return NextResponse.json({ message: "Harga harus berupa bilangan bulat lebih dari 0." }, { status: 400 });
    data.harga = harga;
  }
  if (!partial || form.has("lokasi")) {
    const lokasi = parseLapanganLokasi(form.get("lokasi"));
    if (lokasi === undefined) {
      return NextResponse.json(
        { message: "Lokasi harus berupa link Google Maps (https) dan maksimal 500 karakter." },
        { status: 400 },
      );
    }
    data.lokasi = lokasi;
  }
  if (!partial || form.has("deskripsi")) {
    const deskripsi = parseLapanganDeskripsi(form.get("deskripsi"));
    if (deskripsi === undefined) {
      return NextResponse.json({ message: "Deskripsi maksimal 2000 karakter." }, { status: 400 });
    }
    data.deskripsi = deskripsi;
  }
  if (!partial || form.has("aktif")) {
    data.aktif = form.get("aktif") !== "false";
  }

  const file = form.get("gambar");
  const newFile = isFilled(file) ? file : null;
  const removeImage = form.get("hapusGambar") === "true";

  if (partial && !newFile && !removeImage && Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Tidak ada perubahan yang dikirim." }, { status: 400 });
  }

  let newKey: string | null = null;
  if (newFile) {
    try {
      newKey = await processAndUploadImage(newFile);
    } catch (e) {
      if (e instanceof ImageError) return NextResponse.json({ message: e.message }, { status: e.status });
      throw e;
    }
    data.gambar = newKey;
  } else if (removeImage) {
    data.gambar = null;
  }

  let lapangan;
  try {
    lapangan = await prisma.lapangan.update({ where: { id }, data });
  } catch {
    if (newKey) await deleteImage(newKey).catch(() => {});
    return NextResponse.json({ message: "Gagal menyimpan perubahan. Coba lagi." }, { status: 500 });
  }

  if (data.gambar !== undefined && existing.gambar && existing.gambar !== data.gambar) {
    await deleteImage(existing.gambar).catch(() => {});
  }

  return NextResponse.json(addImageUrl(lapangan));
}

export function PUT(req: Request, ctx: Ctx) {
  return update(req, ctx, false);
}

export function PATCH(req: Request, ctx: Ctx) {
  return update(req, ctx, true);
}

/** DELETE /api/lapangan/:id - Menghapus lapangan. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { response } = await requireApiUser(["ADMIN"]);
  if (response) return response;

  const { id } = await params;
  if (!isLapanganId(id)) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  const existing = await prisma.lapangan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  const jumlahBooking = await prisma.booking.count({ where: { lapanganId: id } });
  if (jumlahBooking > 0) {
    return NextResponse.json(
      { message: "Lapangan ini sudah punya booking, jadi tidak bisa dihapus. Nonaktifkan saja." },
      { status: 409 },
    );
  }

  try {
    await prisma.lapangan.delete({ where: { id } });
  } catch {
    return NextResponse.json({ message: "Gagal menghapus lapangan. Coba lagi." }, { status: 500 });
  }

  if (existing.gambar) await deleteImage(existing.gambar).catch(() => {});

  return NextResponse.json({ message: "Lapangan dihapus." });
}
