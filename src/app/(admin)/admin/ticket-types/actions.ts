'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/modules/shared';
import { ticketingService, CancelTicketInputSchema } from '@/modules/ticketing';

export async function cancelTicketAction(formData: {
  ticketId: string;
  reason: string;
}) {
  try {
    // 1. Verify admin privilege
    await requireRole(['admin']);

    // 2. Validate input schema (min 5 chars reason per US-08 #4)
    const validated = CancelTicketInputSchema.parse({
      ticket_id: formData.ticketId,
      reason: formData.reason,
    });

    // 3. Call cancellation usecase (delegates to atomic RPC ticket_admin_cancel_ticket)
    const result = await ticketingService.cancelTicket({
      ticket_id: validated.ticket_id,
      reason: validated.reason,
    });

    if (!result.success) {
      return { success: false, message: result.message || 'Gagal membatalkan tiket.' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/ticket-types');
    revalidatePath('/my-tickets');
    return { success: true, message: 'Tiket berhasil dibatalkan dan kuota telah dikembalikan.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return { success: false, message: errorMsg };
  }
}

