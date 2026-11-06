/**
 * Shared Module - Public Service Interface
 * Single official entry point for shared cross-cutting concerns.
 */

// Auth
export { getCurrentUser, type CurrentUserSession } from './auth/get-current-user';
export { requireRole, hasRequiredRole } from './auth/require-role';

// Supabase Clients & Middleware
export { createClient } from './supabase/client';
export { createServerClient, createAdminClient } from './supabase/server';
export { updateSession } from './supabase/middleware';

// Audit
export { writeAuditLog, type AuditLogPayload } from './audit/write-audit-log';

// Errors
export { AppError, type AppErrorDetails } from './errors/app-error';

// Types
export type {
  Database,
  Profile,
  AuditLog,
  UserRole,
  Json,
} from './types/database.types';

// UI Components
export { Button, buttonVariants, type ButtonProps } from './ui/button';
export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  type DialogProps,
} from './ui/dialog';
export {
  ToastProvider,
  useToast,
  type ToastType,
  type ToastMessage,
} from './ui/toast';
