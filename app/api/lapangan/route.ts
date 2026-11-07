import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/r2";
import { addImageUrl, ImageError, isFilled, processAndUploadImage } from "@/lib/image";
import {
  parseLapanganDeskripsi,
  parseLapanganHarga,
  parseLapanganLokasi,
  parseLapanganNama,
} from "@/lib/lapangan";

/** GET /api/lapangan - Mengambil daftar lapangan beserta URL gambarnya. */
export async function GET() {
  const daftar = await prisma.lapangan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(daftar.map(addImageUrl));
}

/** POST /api/lapangan - Membuat lapangan baru beserta gambar opsional. */
export async function POST(req: Request) {
  const { response } = await requireApiUser(["ADMIN"]);
  if (response) return response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Request harus berupa multipart/form-data." }, { status: 400 });
  }

  const nama = parseLapanganNama(form.get("nama"));
  const harga = parseLapanganHarga(form.get("harga"));
  const lokasi = parseLapanganLokasi(form.get("lokasi"));
  const deskripsi = parseLapanganDeskripsi(form.get("deskripsi"));
  const aktif = form.get("aktif") !== "false";
  const file = form.get("gambar");

  if (!nama) {
    return NextResponse.json({ message: "Nama lapangan harus 3–100 karakter." }, { status: 400 });
  }
  if (!harga) {
    return NextResponse.json({ message: "Harga harus berupa bilangan bulat lebih dari 0." }, { status: 400 });
  }
  if (lokasi === undefined) {
    return NextResponse.json(
      { message: "Lokasi harus berupa link Google Maps (https) dan maksimal 500 karakter." },
      { status: 400 },
    );
  }
  if (deskripsi === undefined) {
    return NextResponse.json({ message: "Deskripsi maksimal 2000 karakter." }, { status: 400 });
  }

  let gambar: string | null = null;
  if (isFilled(file)) {
    try {
      gambar = await processAndUploadImage(file);
    } catch (e) {
      if (e instanceof ImageError) return NextResponse.json({ message: e.message }, { status: e.status });
      throw e;
    }
  }

  try {
    const lapangan = await prisma.lapangan.create({
      data: { nama, harga, aktif, lokasi, deskripsi, gambar },
    });

    return NextResponse.json(addImageUrl(lapangan), { status: 201 });
  } catch {
    if (gambar) await deleteImage(gambar).catch(() => {});
    return NextResponse.json({ message: "Gagal menyimpan lapangan. Coba lagi." }, { status: 500 });
  }
}
