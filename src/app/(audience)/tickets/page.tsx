import { catalogService } from '@/modules/event-catalog';
import { ticketingService, ClaimButton } from '@/modules/ticketing';
import { handleClaimTicketAction } from './actions';
import { Ticket, Calendar, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TicketsPage() {
  const event = await catalogService.getActiveEvent();
  const ticketTypes = event ? await ticketingService.getQuotaStatus(event.id) : [];

  const formatPrice = (price: number) => {
    if (price === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 max-w-5xl space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <Ticket className="h-3.5 w-3.5" />
          <span>Tiket Resmi TERRAFEST 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Kategori & Pemesanan Tiket</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Pilih kategori tiket yang Anda inginkan. Sistem klaim terproteksi transaksi atomik anti-overselling.
        </p>
      </div>

      {ticketTypes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground space-y-2">
          <Ticket className="mx-auto h-12 w-12 opacity-30" />
          <h3 className="text-lg font-bold text-foreground">Tiket Belum Tersedia</h3>
          <p className="text-sm">Panitia akan segera membuka sesi war ticket.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ticketTypes.map((type) => {
            const isSoldOut = type.remaining_quota <= 0;
            const now = new Date();
            const startsAt = new Date(type.sale_starts_at);
            const endsAt = new Date(type.sale_ends_at);
            const isNotOpenYet = now < startsAt;
            const isClosed = now > endsAt;

            const isAvailable = !isSoldOut && !isNotOpenYet && !isClosed;
            let disabledReason: string | undefined;

            if (isSoldOut) disabledReason = 'Tiket Habis (Sold Out)';
            else if (isNotOpenYet) disabledReason = `Dibuka ${formatDate(type.sale_starts_at)}`;
            else if (isClosed) disabledReason = 'Penjualan Ditutup';

            return (
              <div
                key={type.id}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{type.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Maks. {type.max_per_user} tiket per akun</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        type.availability === 'Habis'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : type.availability === 'Hampir Habis'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {type.availability}
                    </span>
                  </div>

                  <div className="py-2">
                    <span className="text-3xl font-extrabold text-primary">{formatPrice(type.price_idr)}</span>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Periode Penjualan:
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(type.sale_starts_at)} - {formatDate(type.sale_ends_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        Sisa Kuota:
                      </span>
                      <span className="font-semibold text-foreground">
                        {type.remaining_quota} / {type.quota_total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <ClaimButton
                    ticketTypeId={type.id}
                    ticketTypeName={type.name}
                    isAvailable={isAvailable}
                    disabledReason={disabledReason}
                    onClaimAction={handleClaimTicketAction}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
