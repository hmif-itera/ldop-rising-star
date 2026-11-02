import Link from 'next/link';
import { requireRole } from '@/modules/shared';
import { LayoutDashboard, Calendar, Ticket, UserCheck, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin role on server component (FR-AUTH-05, US-10 #5)
  const profile = await requireRole(['admin']);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-foreground">TERRAFEST ADMIN</h2>
            <p className="text-xs text-muted-foreground truncate">{profile.full_name ?? profile.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dasbor Realtime</span>
          </Link>
          <Link
            href="/admin/events"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary bg-primary/10 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Katalog & Rundown</span>
          </Link>
          <Link
            href="/admin/ticket-types"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Ticket className="h-4 w-4" />
            <span>Kategori & Kuota</span>
          </Link>
          <Link
            href="/admin/attendance"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            <span>Kehadiran & Gate</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center py-2 border rounded-md"
          >
            ← Kembali ke Web Publik
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
