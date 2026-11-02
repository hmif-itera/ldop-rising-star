/**
 * Attendance Module - Public Service Interface
 * Single official entry point for gate verification, check-in, anti double-entry, and scan logging.
 */

// Use cases
export { verifyAndCheckin } from './application/verify-and-checkin.usecase';
export {
  listGates,
  getStaffRecentLogs,
  getAttendanceSummary,
} from './application/attendance-summary.usecase';

// Domain & DTOs
export {
  type AttendanceResult,
  AttendanceResultBannerConfig,
} from './domain/checkin-result';

export {
  VerifyCheckinInputSchema,
  type VerifyCheckinInput,
  type VerifyCheckinResultDTO,
  type GateDTO,
  type CheckinLogDTO,
  type AttendanceSummaryDTO,
} from './dto/attendance.dto';

// UI Components
export { QRScanner, type QRScannerProps } from './ui/qr-scanner';
export { ScanResultBanner, type ScanResultBannerProps } from './ui/scan-result-banner';

// Public Service Facade
import { verifyAndCheckin } from './application/verify-and-checkin.usecase';
import { listGates, getStaffRecentLogs, getAttendanceSummary } from './application/attendance-summary.usecase';

export const attendanceService = {
  verifyAndCheckin,
  listGates,
  getStaffRecentLogs,
  getAttendanceSummary,
};
