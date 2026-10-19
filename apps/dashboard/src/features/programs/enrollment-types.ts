import { z } from 'zod';

export const ENROLLMENT_STATUSES = ['active', 'paused', 'completed', 'dropped'] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

const named = { name_ar: z.string(), name_en: z.string() };

/**
 * تسجيل المريض في برنامج (D-19 · docs/20 · 5.2): المرحلة الحالية ومن إمتى هو فيها (عشان "متأخر عن مرحلته"
 * = أيام في المرحلة أكتر من §expected_days§ بتاعها). التاريخ (الانتقالات) بيرجع في تاب "البرامج" بتاع ملف المريض.
 */
export const enrollmentEventSchema = z.object({
  id: z.string(),
  from_stage_id: z.string().nullable(),
  to_stage_id: z.string(),
  at: z.string(),
  by: z.object(named),
  note: z.string(),
});

export type EnrollmentEvent = z.infer<typeof enrollmentEventSchema>;

export const enrollmentSchema = z.object({
  id: z.string(),
  program_id: z.string(),
  patient: z.object({ id: z.string(), ...named, file_no: z.string() }),
  branch_id: z.string(),
  owner: z.object(named).nullable(),
  stage_id: z.string(),
  // وقت دخول المرحلة الحالية (ISO)
  stage_entered_at: z.string(),
  started_on: z.string(),
  status: z.enum(ENROLLMENT_STATUSES),
  history: z.array(enrollmentEventSchema),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;

export type EnrollBody = { program_id: string; patient_id: string; branch_id: string };

export type MoveStageBody = { id: string; to_stage_id: string; note: string };
