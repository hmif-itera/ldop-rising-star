import { PagePlaceholder } from "@/components/page-placeholder";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LapanganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PagePlaceholder
        title={`Detail Lapangan ${id}`}
        owner="Frontend"
        items={[
          "Tampilkan informasi lapangan, harga, foto, dan statusnya.",
          "Lapangan nonaktif tetap dapat dilihat, tetapi tidak dapat dipesan.",
        ]}
      />
      <Button asChild><Link href={`/lapangan/${id}/booking`}>Booking Lapangan</Link></Button>
    </div>
  );
}
