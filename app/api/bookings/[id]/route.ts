import { notImplemented } from "@/lib/placeholder";
import { requireApiUser } from "@/lib/guard";

/** GET /api/bookings/:id - Mengambil detail booking. */
export async function GET() {
  const { response } = await requireApiUser(["USER", "ADMIN"]);
  return response ?? notImplemented();
}

/** PUT /api/bookings/:id - Mengganti data booking. */
export async function PUT() {
  const { response } = await requireApiUser(["USER", "ADMIN"]);
  return response ?? notImplemented();
}

/** PATCH /api/bookings/:id - Memperbarui sebagian data booking. */
export async function PATCH() {
  const { response } = await requireApiUser(["USER", "ADMIN"]);
  return response ?? notImplemented();
}

/** DELETE /api/bookings/:id - Menghapus booking. */
export async function DELETE() {
  const { response } = await requireApiUser(["USER", "ADMIN"]);
  return response ?? notImplemented();
}
