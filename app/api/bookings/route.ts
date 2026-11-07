import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/guard";

/** GET /api/bookings — Daftar booking milik user yang login. */
export async function GET() {
  const { user, response } = await requireApiUser(["USER", "ADMIN"]);
  if (response) return response;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: user!.id },
      include: { lapangan: { select: { nama: true, harga: true } } },
      orderBy: { tanggalAwal: "desc" },
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json(
      { message: "Gagal memuat booking." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bookings
 * Body: { lapanganId, slots: [{ tanggal: "YYYY-MM-DD", jam: 8 }, ...] }
 *
 * Membuat satu atau lebih booking sekaligus.
 * Setiap slot = 1 jam (misal jam:8 → 08:00–09:00).
 */
export async function POST(req: NextRequest) {
  const { user, response } = await requireApiUser(["USER", "ADMIN"]);
  if (response) return response;

  try {
    const body = await req.json();
    const { lapanganId, slots } = body as {
      lapanganId: string;
      slots: { tanggal: string; jam: number }[];
    };

    if (!lapanganId || !slots || slots.length === 0) {
      return NextResponse.json(
        { message: "lapanganId dan slots wajib diisi." },
        { status: 400 },
      );
    }

    // Validasi lapangan
    const lapangan = await prisma.lapangan.findUnique({
      where: { id: lapanganId },
    });
    if (!lapangan || !lapangan.aktif) {
      return NextResponse.json(
        { message: "Lapangan tidak ditemukan atau tidak aktif." },
        { status: 404 },
      );
    }

    // Cek konflik per slot
    const bookingsToCreate: { tanggalAwal: Date; tanggalAkhir: Date }[] = [];

    for (const slot of slots) {
      const tanggalAwal = new Date(`${slot.tanggal}T${String(slot.jam).padStart(2, "0")}:00:00+07:00`);
      const tanggalAkhir = new Date(tanggalAwal.getTime() + 60 * 60 * 1000);

      // Cek apakah slot sudah terisi
      const conflict = await prisma.booking.findFirst({
        where: {
          lapanganId,
          status: { in: ["PENDING", "CONFIRMED"] },
          tanggalAwal: { lt: tanggalAkhir },
          tanggalAkhir: { gt: tanggalAwal },
        },
      });

      if (conflict) {
        return NextResponse.json(
          {
            message: `Slot ${slot.tanggal} jam ${String(slot.jam).padStart(2, "0")}:00 sudah dipesan.`,
          },
          { status: 409 },
        );
      }

      bookingsToCreate.push({ tanggalAwal, tanggalAkhir });
    }

    // Buat semua booking
    const created = [];
    for (const { tanggalAwal, tanggalAkhir } of bookingsToCreate) {
      const booking = await prisma.booking.create({
        data: {
          userId: user!.id!,
          lapanganId,
          tanggalAwal,
          tanggalAkhir,
          status: "PENDING",
        },
      });
      created.push(booking);
    }

    return NextResponse.json(
      {
        message: "Booking berhasil dibuat!",
        bookings: created,
        totalHarga: created.length * lapangan.harga,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Gagal membuat booking." },
      { status: 500 },
    );
  }
}
