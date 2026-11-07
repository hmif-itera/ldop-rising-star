import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/guard";

export default async function BookingsPage() {
  await requireUser(["USER", "ADMIN"]);
  return <PagePlaceholder title="Booking" owner="Frontend" items={["Tampilkan booking milik pengguna yang masuk.", "Tampilkan status dan jadwal booking."]} />;
}
