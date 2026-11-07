// Halaman uji untuk melihat loading screen. Hapus folder ini sebelum dikumpulkan.
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CobaLoadingPage() {
  await new Promise((resolve) => setTimeout(resolve, 6000));

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg font-bold">Selesai dimuat! 🏀</p>
      <div className="flex gap-3">
        <Button asChild><Link href="/coba-loading?ulang=1">Lihat lagi</Link></Button>
        <Button asChild variant="outline"><Link href="/">Ke Beranda</Link></Button>
      </div>
    </main>
  );
}
