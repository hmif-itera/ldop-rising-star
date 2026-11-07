import { NextResponse } from "next/server";
import { notImplemented } from "@/lib/placeholder";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/profile/:id - Mengambil profil publik pengguna. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Profil pengguna tidak ditemukan." }, { status: 404 });
  }

  return notImplemented();
}
