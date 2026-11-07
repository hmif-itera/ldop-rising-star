import { requireUser } from "@/lib/guard";
import { PagePlaceholder } from "@/components/page-placeholder";

export default async function LapanganBookingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["USER", "ADMIN"]);
  const { id } = await params;

  return (
    <PagePlaceholder
      title={`Booking Lapangan ${id}`}
      owner="Frontend"
      items={[
        "Sediakan pilihan tanggal dan jam booking.",
        "Tampilkan ringkasan lapangan dan harga sebelum booking dikirim.",
        "Hubungkan formulir dengan proses pembuatan booking.",
      ]}
    />
  );
}
