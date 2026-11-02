import { ticketingService, TicketQR, TicketStatusLabel } from '@/modules/ticketing';
import { Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/modules/shared';

export const dynamic = 'force-dynamic';

export default async function MyTicketsPage() {
  const tickets = await ticketingService.listMyTickets();

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tiket Saya</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Daftar tiket konser Terra Festival ITERA yang Anda miliki. Tunjukkan kode QR di gate acara.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground space-y-4">
          <Ticket className="mx-auto h-14 w-14 opacity-30 text-primary" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">Belum Ada Tiket yang Diklaim</h3>
            <p className="text-sm">Anda belum mengklaim tiket untuk festival ini.</p>
          </div>
          <Link href="/tickets">
            <Button size="sm" className="mt-2">
              Klaim Tiket Sekarang
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {tickets.map((t) => {
            const isActive = t.status === 'ACTIVE';
            const isUsed = t.status === 'USED';
            const isCancelled = t.status === 'CANCELLED';

            return (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm grid grid-cols-1 md:grid-cols-3"
              >
                {/* Left: Ticket Info */}
                <div className="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isUsed
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {isUsed && <Clock className="h-3.5 w-3.5" />}
                        {isCancelled && <XCircle className="h-3.5 w-3.5" />}
                        {TicketStatusLabel[t.status]}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      {t.ticket_type_name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      ID Tiket: <span className="font-mono">{t.id}</span>
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
                    <p>Waktu Klaim: {new Date(t.claimed_at).toLocaleString('id-ID')}</p>
                    {t.used_at && <p>Waktu Check-in: {new Date(t.used_at).toLocaleString('id-ID')}</p>}
                    <p className="font-medium text-foreground pt-1">
                      Lokasi: Lapangan Utama ITERA (Terra Festival 2026)
                    </p>
                  </div>
                </div>

                {/* Right: QR Code Display (US-05 #2) */}
                <div className="bg-muted/40 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border">
                  {isActive ? (
                    <TicketQR token={t.qr_token} size={160} />
                  ) : (
                    <div className="text-center p-6 text-muted-foreground space-y-2">
                      {isUsed ? (
                        <>
                          <Clock className="mx-auto h-12 w-12 text-amber-500 opacity-60" />
                          <p className="text-xs font-semibold text-amber-600">Tiket Telah Digunakan</p>
                          <p className="text-[11px]">QR Code sudah tidak dapat dipindai lagi.</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="mx-auto h-12 w-12 text-red-500 opacity-60" />
                          <p className="text-xs font-semibold text-red-600">Tiket Telah Dibatalkan</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
