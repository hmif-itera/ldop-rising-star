'use client';

import * as React from 'react';
import { Button, useToast } from '@/modules/shared';
import { Ticket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ClaimButtonProps {
  ticketTypeId: string;
  ticketTypeName: string;
  isAvailable: boolean;
  disabledReason?: string;
  onClaimAction: (ticketTypeId: string) => Promise<{ success: boolean; message?: string; code?: string }>;
}

export function ClaimButton({
  ticketTypeId,
  ticketTypeName,
  isAvailable,
  disabledReason,
  onClaimAction,
}: ClaimButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleClaim = async () => {
    if (!isAvailable) return;
    try {
      setLoading(true);
      const res = await onClaimAction(ticketTypeId);

      if (res.success) {
        showToast({
          type: 'success',
          title: 'Klaim Berhasil!',
          description: `Tiket ${ticketTypeName} berhasil diterbitkan. Silakan cek halaman Tiket Saya.`,
        });
        router.push('/my-tickets');
      } else {
        showToast({
          type: 'error',
          title: 'Klaim Gagal',
          description: res.message || 'Gagal memproses klaim tiket.',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan saat memproses tiket.';
      showToast({
        type: 'error',
        title: 'Kesalahan Sistem',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClaim}
      disabled={!isAvailable || loading}
      className={`w-full font-semibold ${
        !isAvailable
          ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Memproses Klaim...
        </>
      ) : !isAvailable ? (
        disabledReason || 'Kuota Habis'
      ) : (
        <>
          <Ticket className="h-4 w-4 mr-2" />
          Klaim Tiket Sekarang
        </>
      )}
    </Button>
  );
}
