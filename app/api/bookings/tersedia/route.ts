import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bookings/tersedia?lapanganId=xxx&tanggal=2026-11-03
 *
 * Mengembalikan slot jam 08:00–23:00 dengan status tersedia/sudah-dipesan
 * untuk lapangan & tanggal tertentu. Publik — tidak perlu auth agar user bisa
 * melihat ketersediaan sebelum login.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lapanganId = searchParams.get("lapanganId");
  const tanggal = searchParams.get("tanggal"); // YYYY-MM-DD

  if (!lapanganId || !tanggal) {
    return NextResponse.json(
      { message: "Parameter lapanganId dan tanggal wajib diisi." },
      { status: 400 },
    );
  }

  // Validasi format tanggal
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) {
    return NextResponse.json(
      { message: "Format tanggal harus YYYY-MM-DD." },
      { status: 400 },
    );
  }

  try {
    // Batas hari: awal hari s.d. akhir hari (UTC+7 → kita pakai start/end UTC offset)
    const dayStart = new Date(`${tanggal}T00:00:00+07:00`);
    const dayEnd = new Date(`${tanggal}T23:59:59+07:00`);

    // Ambil semua booking yang overlap di hari tersebut
    const bookings = await prisma.booking.findMany({
      where: {
        lapanganId,
        status: { in: ["PENDING", "CONFIRMED"] },
        tanggalAwal: { lt: dayEnd },
        tanggalAkhir: { gt: dayStart },
      },
      select: { tanggalAwal: true, tanggalAkhir: true },
    });

    // Buat set jam yang sudah terpesan
    const bookedHours = new Set<number>();
    for (const b of bookings) {
      // Jika booking di timezone WIB, convert
      const startWIB = new Date(b.tanggalAwal);
      const endWIB = new Date(b.tanggalAkhir);

      // Iterasi per jam antara start dan end
      const cursor = new Date(startWIB);
      while (cursor < endWIB) {
        // Ambil jam dalam WIB (offset +7)
        const hourWIB = (cursor.getUTCHours() + 7) % 24;
        bookedHours.add(hourWIB);
        cursor.setTime(cursor.getTime() + 60 * 60 * 1000);
      }
    }

    // Generate slot 08:00 sampai 22:00 (jam terakhir main 22:00–23:00)
    const JAM_BUKA = 8;
    const JAM_TUTUP = 23; // slot terakhir = 22:00 – 23:00
    const slots = [];
    for (let jam = JAM_BUKA; jam < JAM_TUTUP; jam++) {
      slots.push({
        jam, // 8, 9, ... 22
        label: `${String(jam).padStart(2, "0")}:00`,
        tersedia: !bookedHours.has(jam),
      });
    }

    return NextResponse.json({ tanggal, lapanganId, slots });
  } catch (error) {
    console.error("Error fetching ketersediaan:", error);
    return NextResponse.json(
      { message: "Gagal memuat ketersediaan." },
      { status: 500 },
    );
  }
}
