import { createServerClient } from '../supabase/server';
import type { Json } from '../types/database.types';

export interface AuditLogPayload {
  action: string;
  entityType: string;
  entityId: string;
  oldData?: Json | null;
  newData?: Json | null;
}

export async function writeAuditLog({
  action,
  entityType,
  entityId,
  oldData = null,
  newData = null,
}: AuditLogPayload): Promise<void> {
  try {
    const supabase = await createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('shared_write_audit', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_old: oldData ?? undefined,
      p_new: newData ?? undefined,
    });

    if (error) {
      console.error('[AUDIT_ERROR] Failed to write audit log via RPC:', error.message);
    }
  } catch (err) {
    console.error('[AUDIT_UNEXPECTED_ERROR]', err);
  }
}
