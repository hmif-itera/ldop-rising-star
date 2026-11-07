import { notImplemented } from "@/lib/placeholder";
import { requireApiUser } from "@/lib/guard";

/** PATCH /api/me - Memperbarui profil pengguna yang sedang masuk. */
export async function PATCH() {
  const { response } = await requireApiUser(["USER", "ADMIN"]);
  return response ?? notImplemented();
}
