import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/guard";
import { isLapanganId } from "@/lib/lapangan";
import { parseKomentar, parseRating, readRatingBody } from "@/lib/rating";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lapangan/:id/ratings - Daftar rating dan ringkasan nilai lapangan. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id: lapanganId } = await params;
  if (!isLapanganId(lapanganId)) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  try {
    const lapangan = await prisma.lapangan.findUnique({ where: { id: lapanganId }, select: { id: true } });
    if (!lapangan) return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });

    const [ratings, summary] = await Promise.all([
      prisma.rating.findMany({
        where: { lapanganId },
        select: {
          id: true,
          lapanganId: true,
          userId: true,
          rating: true,
          komentar: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { nama: true, foto: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rating.aggregate({ where: { lapanganId }, _avg: { rating: true }, _count: { _all: true } }),
    ]);

    return NextResponse.json({
      lapanganId,
      rataRata: summary._avg.rating ?? 0,
      jumlah: summary._count._all,
      ratings,
    });
  } catch {
    return NextResponse.json({ message: "Gagal memuat rating lapangan." }, { status: 500 });
  }
}

/** POST /api/lapangan/:id/ratings - Membuat rating untuk lapangan. */
export async function POST(req: Request, { params }: Ctx) {
  const { user, response } = await requireApiUser(["USER", "ADMIN"]);
  if (response) return response;

  const { id: lapanganId } = await params;
  if (!isLapanganId(lapanganId)) {
    return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });
  }

  const body = await readRatingBody(req);
  if (!body) return NextResponse.json({ message: "Body harus berupa JSON yang valid." }, { status: 400 });

  const rating = parseRating(body.rating);
  if (rating === undefined) {
    return NextResponse.json({ message: "Rating wajib berupa angka dari 0 sampai 5." }, { status: 400 });
  }

  const komentar = body.komentar === undefined ? null : parseKomentar(body.komentar);
  if (komentar === undefined) {
    return NextResponse.json({ message: "Komentar harus berupa teks maksimal 2000 karakter." }, { status: 400 });
  }

  try {
    const lapangan = await prisma.lapangan.findUnique({ where: { id: lapanganId }, select: { id: true } });
    if (!lapangan) return NextResponse.json({ message: "Lapangan tidak ditemukan." }, { status: 404 });

    const created = await prisma.rating.create({
      data: { lapanganId, userId: user!.id, rating, komentar },
      select: {
        id: true,
        lapanganId: true,
        userId: true,
        rating: true,
        komentar: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { nama: true, foto: true } },
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "Kamu sudah memberi rating untuk lapangan ini. Ubah rating yang sudah ada." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "Gagal menyimpan rating. Coba lagi." }, { status: 500 });
  }
}
