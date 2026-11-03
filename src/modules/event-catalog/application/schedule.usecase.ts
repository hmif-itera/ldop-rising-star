import { CatalogRepository } from '../infrastructure/catalog.repository';
import { requireRole, writeAuditLog, AppError, type Json } from '@/modules/shared';
import { CreateScheduleSchema, type CreateScheduleInput, type ScheduleItemDTO, type StageDTO } from '../dto/catalog.dto';

export async function getSchedule(eventId: string, stageId?: string): Promise<ScheduleItemDTO[]> {
  return CatalogRepository.listSchedules(eventId, stageId);
}

export async function listStages(eventId: string): Promise<StageDTO[]> {
  return CatalogRepository.listStages(eventId);
}

export async function createScheduleSession(input: CreateScheduleInput): Promise<{ success: boolean; message: string }> {
  // US-10: Hanya admin yang dapat membuat sesi jadwal
  await requireRole(['admin']);

  const validated = CreateScheduleSchema.parse(input);

  // FR-CAT-07: Validasi jadwal bentrok pada panggung yang sama
  const hasConflict = await CatalogRepository.findConflictingSchedule(
    validated.stage_id,
    validated.starts_at,
    validated.ends_at
  );

  if (hasConflict) {
    throw AppError.badRequest('Jadwal bentrok: Panggung telah digunakan oleh sesi penampil lain pada rentang waktu ini.');
  }

  await CatalogRepository.createSchedule(validated);

  // US-10 & FR-AUD-01: Catat di audit log
  await writeAuditLog({
    action: 'SCHEDULE_CREATED',
    entityType: 'catalog_schedules',
    entityId: validated.stage_id,
    newData: validated as unknown as Json,
  });

  return { success: true, message: 'Jadwal penampil berhasil ditambahkan.' };
}

export async function deleteScheduleSession(scheduleId: string): Promise<{ success: boolean }> {
  await requireRole(['admin']);

  await CatalogRepository.softDeleteSchedule(scheduleId);

  await writeAuditLog({
    action: 'SCHEDULE_DELETED',
    entityType: 'catalog_schedules',
    entityId: scheduleId,
  });

  return { success: true };
}
