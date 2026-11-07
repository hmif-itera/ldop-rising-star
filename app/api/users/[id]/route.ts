import { notImplemented } from "@/lib/placeholder";
import { requireApiUser } from "@/lib/guard";

/** GET /api/users/:id - Mengambil detail akun pengguna untuk admin. */
export async function GET() {
  const { response } = await requireApiUser(["ADMIN"]);
  return response ?? notImplemented();
}

/** PUT /api/users/:id - Mengganti data akun pengguna. */
export async function PUT() {
  const { response } = await requireApiUser(["ADMIN"]);
  return response ?? notImplemented();
}

/** PATCH /api/users/:id - Memperbarui sebagian data akun pengguna. */
export async function PATCH() {
  const { response } = await requireApiUser(["ADMIN"]);
  return response ?? notImplemented();
}

/** DELETE /api/users/:id - Menghapus akun pengguna. */
export async function DELETE() {
  const { response } = await requireApiUser(["ADMIN"]);
  return response ?? notImplemented();
}
