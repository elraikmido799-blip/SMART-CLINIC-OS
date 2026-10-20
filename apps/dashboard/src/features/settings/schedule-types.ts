import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

/**
 * جدول دكتور (D-37): أسبوعي (يوم بيوم: الفرع ومن/إلى، أو إجازة) + إجازات بتواريخ. السبت = 0 لحد الجمعة = 6.
 * أي إجازة بتتفحص قبل الحفظ لو فيها مواعيد محجوزة (`conflicts`).
 */
export const scheduleSchema = z.object({
  practitioner_id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  specialty: z.custom<Specialty>(isSpecialty),
  weekly: z.array(
    z.object({
      day: z.number(),
      off: z.boolean(),
      branch_id: z.string(),
      start: z.string(),
      end: z.string(),
    }),
  ),
  leaves: z.array(
    z.object({
      id: z.string(),
      from: z.string(),
      to: z.string(),
      reason: z.string(),
    }),
  ),
});

export type DoctorSchedule = z.infer<typeof scheduleSchema>;

export type SaveWeeklyBody = {
  practitioner_id: string;
  weekly: DoctorSchedule['weekly'];
};

export type AddLeaveBody = { practitioner_id: string; from: string; to: string; reason: string };

export type RemoveLeaveBody = { practitioner_id: string; leave_id: string };

export type LeaveConflictQuery = { practitioner_id: string; from: string; to: string };

/** المواعيد المحجوزة (مش ملغية) اللي هتقع في إجازة */
export const conflictsSchema = z.object({ count: z.number() });
