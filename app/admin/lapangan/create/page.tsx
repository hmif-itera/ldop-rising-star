import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function CreateFieldPage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href="/admin/lapangan"><ArrowLeft aria-hidden="true" />Kembali ke Lapangan</Link>
      </Button>
      <PagePlaceholder
        title="Tambah Lapangan"
        owner="Frontend"
        items={["Sediakan form nama, harga, lokasi, dan deskripsi lapangan.", "Simpan lapangan baru."]}
      />
    </div>
  );
}
