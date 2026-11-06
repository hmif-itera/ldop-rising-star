'use server';

import { ticketingService } from '@/modules/ticketing';
import { revalidatePath } from 'next/cache';

export async function handleClaimTicketAction(ticketTypeId: string) {
  try {
    const result = await ticketingService.claimTicket({
      ticket_type_id: ticketTypeId,
      quantity: 1,
    });

    if (result.success) {
      revalidatePath('/tickets');
      revalidatePath('/my-tickets');
    }

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses klaim tiket.';
    return {
      success: false,
      code: 'CLAIM_FAILED',
      message,
    };
  }
}
