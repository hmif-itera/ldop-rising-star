import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/guard";
import { isRatingId, parseKomentar, parseRating, readRatingBody } from "@/lib/rating";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/ratings/:id - Mengambil detail rating. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isRatingId(id)) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });

  try {
    const rating = await prisma.rating.findUnique({
      where: { id },
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
    if (!rating) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });
    return NextResponse.json(rating);
  } catch {
    return NextResponse.json({ message: "Gagal memuat rating." }, { status: 500 });
  }
}

async function updateRating(req: Request, { params }: Ctx, partial: boolean) {
  const { user, response } = await requireApiUser(["USER", "ADMIN"]);
  if (response) return response;

  const { id } = await params;
  if (!isRatingId(id)) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });

  const body = await readRatingBody(req);
  if (!body) return NextResponse.json({ message: "Body harus berupa JSON yang valid." }, { status: 400 });
  if (partial && !Object.hasOwn(body, "rating") && !Object.hasOwn(body, "komentar")) {
    return NextResponse.json({ message: "Kirim rating atau komentar yang ingin diubah." }, { status: 400 });
  }

  const data: { rating?: number; komentar?: string | null } = {};
  if (!partial || Object.hasOwn(body, "rating")) {
    const rating = parseRating(body.rating);
    if (rating === undefined) {
      return NextResponse.json({ message: "Rating wajib berupa angka dari 0 sampai 5." }, { status: 400 });
    }
    data.rating = rating;
  }
  if (!partial || Object.hasOwn(body, "komentar")) {
    const komentar = body.komentar === undefined && !partial ? null : parseKomentar(body.komentar);
    if (komentar === undefined) {
      return NextResponse.json({ message: "Komentar harus berupa teks maksimal 2000 karakter atau null." }, { status: 400 });
    }
    data.komentar = komentar;
  }

  try {
    const existing = await prisma.rating.findUnique({ where: { id }, select: { id: true, userId: true } });
    if (!existing) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });
    if (existing.userId !== user!.id) {
      return NextResponse.json({ message: "Kamu hanya bisa mengubah rating milikmu sendiri." }, { status: 403 });
    }

    const updated = await prisma.rating.update({
      where: { id },
      data,
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
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Gagal menyimpan perubahan rating." }, { status: 500 });
  }
}

/** PUT /api/ratings/:id - Mengganti rating dan komentar. */
export function PUT(req: Request, ctx: Ctx) {
  return updateRating(req, ctx, false);
}

/** PATCH /api/ratings/:id - Memperbarui rating atau komentar. */
export function PATCH(req: Request, ctx: Ctx) {
  return updateRating(req, ctx, true);
}

/** DELETE /api/ratings/:id - Menghapus rating milik pengguna yang masuk. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { user, response } = await requireApiUser(["USER", "ADMIN"]);
  if (response) return response;

  const { id } = await params;
  if (!isRatingId(id)) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });

  try {
    const existing = await prisma.rating.findUnique({ where: { id }, select: { id: true, userId: true } });
    if (!existing) return NextResponse.json({ message: "Rating tidak ditemukan." }, { status: 404 });
    if (existing.userId !== user!.id) {
      return NextResponse.json({ message: "Kamu hanya bisa menghapus rating milikmu sendiri." }, { status: 403 });
    }

    await prisma.rating.delete({ where: { id } });
    return NextResponse.json({ message: "Rating berhasil dihapus." });
  } catch {
    return NextResponse.json({ message: "Gagal menghapus rating." }, { status: 500 });
  }
}
