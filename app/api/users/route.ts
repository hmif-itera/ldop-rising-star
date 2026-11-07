import { notImplemented } from "@/lib/placeholder";
import { requireApiUser } from "@/lib/guard";

/** GET /api/users - Mengambil daftar akun pengguna untuk admin. */
export async function GET() {
  const { response } = await requireApiUser(["ADMIN"]);
  return response ?? notImplemented();
}
