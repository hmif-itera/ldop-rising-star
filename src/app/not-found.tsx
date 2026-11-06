import Link from 'next/link';
import { Button } from '@/modules/shared';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-6xl font-extrabold text-primary tracking-tight">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="default">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
