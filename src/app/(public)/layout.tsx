import Link from 'next/link';
import { Button } from '@/modules/shared';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">TERRAFEST</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/lineup" className="hover:text-primary transition-colors">
              Line Up
            </Link>
            <Link href="/schedule" className="hover:text-primary transition-colors">
              Jadwal
            </Link>
            <Link href="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Terra Festival ITERA. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}
