import Link from 'next/link';
import { requireRole } from '@/modules/shared';
import { Ticket, User, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AudienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(['audience', 'gate_staff', 'admin']);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-primary">TERRAFEST</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Tiket</span>
          </Link>
          <nav className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
            <Link href="/tickets" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Beli / Klaim</span>
            </Link>
            <Link href="/my-tickets" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Ticket className="h-4 w-4" />
              <span>Tiket Saya</span>
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l text-xs text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{profile.full_name ?? profile.email}</span>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Terra Festival ITERA. Tiket resmi ber-QR unik anti-overselling.
      </footer>
    </div>
  );
}
