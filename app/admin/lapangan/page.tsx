import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminLapanganPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kelola Lapangan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atur daftar lapangan dan informasi harga.</p>
        </div>
        <Button asChild>
          <Link href="/admin/lapangan/create"><Plus aria-hidden="true" />Tambah Lapangan</Link>
        </Button>
      </div>
      <PagePlaceholder title="Daftar Lapangan" owner="Frontend" items={["Daftar lapangan akan ditampilkan di sini.", "Aksi ubah dan status lapangan tersedia setelah data lapangan terhubung."]} />
    </div>
  );
}
