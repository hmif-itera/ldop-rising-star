import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/guard";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["USER", "ADMIN"]);
  const { id } = await params;
  return <PagePlaceholder title={`Detail Booking ${id}`} owner="Frontend" items={["Tampilkan informasi booking.", "Tampilkan status dan rincian jadwal."]} />;
}
