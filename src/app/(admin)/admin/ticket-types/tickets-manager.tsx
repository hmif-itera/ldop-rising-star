'use client';

import * as React from 'react';
import type { TicketTypeDTO, AdminTicketDTO } from '@/modules/ticketing';
import { cancelTicketAction } from './actions';
import {
  Ticket,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

interface TicketsManagerProps {
  ticketTypes: TicketTypeDTO[];
  initialTickets: AdminTicketDTO[];
}

export function TicketsManager({ ticketTypes, initialTickets }: TicketsManagerProps) {
  const [tickets, setTickets] = React.useState<AdminTicketDTO[]>(initialTickets);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  // Cancel dialog state
  const [selectedTicket, setSelectedTicket] = React.useState<AdminTicketDTO | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.id.toLowerCase().includes(query) ||
      t.owner_name.toLowerCase().includes(query) ||
      t.owner_email.toLowerCase().includes(query) ||
      t.ticket_type_name.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  async function handleConfirmCancel() {
    if (!selectedTicket) return;
    if (cancelReason.trim().length < 5) {
      setActionMessage({ text: 'Alasan pembatalan minimal 5 karakter.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setActionMessage(null);

    const res = await cancelTicketAction({
      ticketId: selectedTicket.id,
      reason: cancelReason.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setActionMessage({ text: res.message, type: 'success' });
      // Update local state
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, status: 'CANCELLED', cancel_reason: cancelReason.trim(), cancelled_at: new Date().toISOString() }
            : t
        )
      );
      setSelectedTicket(null);
      setCancelReason('');
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Kategori Tiket & Manajemen Peserta
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola kuota tiket festival dan batalkan tiket bermasalah sesuai SOP.
        </p>
      </div>

      {/* Ticket Types Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketTypes.map((type) => {
          const pct = type.quota_total > 0 ? Math.round((type.quota_claimed / type.quota_total) * 100) : 0;
          return (
            <div key={type.id} className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-foreground text-base">{type.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    Rp {type.price_idr.toLocaleString('id-ID')}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    type.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {type.is_active ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-1">
                  <span>Terklaim: {type.quota_claimed}</span>
                  <span>Total: {type.quota_total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>Sisa: {type.remaining_quota}</span>
                  <span>Maks {type.max_per_user} / akun</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari ID tiket, nama pemilik, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">ACTIVE (Aktif)</option>
              <option value="USED">USED (Sudah Digunakan)</option>
              <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table (US-08 #2, #3) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Daftar Tiket Terbit ({filteredTickets.length})
          </h2>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Tidak ada tiket yang cocok dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-3">ID Tiket</th>
                  <th className="p-3">Pemilik</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Waktu Klaim</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">
                      {ticket.id.slice(0, 8)}...
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{ticket.owner_name}</div>
                      <div className="text-muted-foreground">{ticket.owner_email}</div>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {ticket.ticket_type_name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                          ticket.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : ticket.status === 'USED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {ticket.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3" />}
                        {ticket.status === 'USED' && <Clock className="h-3 w-3" />}
                        {ticket.status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                        {ticket.status}
                      </span>
                      {ticket.cancel_reason && (
                        <p className="text-2xs text-rose-500 mt-0.5 max-w-[150px] truncate" title={ticket.cancel_reason}>
                          Ket: {ticket.cancel_reason}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.claimed_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {ticket.status === 'ACTIVE' ? (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setCancelReason('');
                            setActionMessage(null);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                        >
                          Batalkan
                        </button>
                      ) : (
                        <span className="text-2xs text-muted-foreground italic">
                          Tidak dapat dibatalkan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal Dialog for Cancellation (US-08 #4) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Batalkan Tiket Ini?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Tiket yang dibatalkan tidak akan dapat digunakan untuk check-in di gate. Kuota kategori{' '}
              <strong className="text-foreground">{selectedTicket.ticket_type_name}</strong> akan
              dikembalikan secara otomatis (+1 kuota sisa).
            </p>

            <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Tiket:</span>
                <span className="font-mono text-foreground">{selectedTicket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pemilik:</span>
                <span className="font-semibold text-foreground">{selectedTicket.owner_name}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Alasan Pembatalan <span className="text-rose-500">* (minimal 5 karakter)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Permintaan pembatalan penonton / Duplikasi akun..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              {cancelReason.trim().length > 0 && cancelReason.trim().length < 5 && (
                <p className="text-2xs text-rose-500">
                  Karakter kurang ({cancelReason.trim().length}/5).
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting || cancelReason.trim().length < 5}
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-colors"
              >
                {isSubmitting ? 'Memproses...' : 'Ya, Batalkan Tiket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

