import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';

const specialty = z.custom<Specialty>(isSpecialty);

export const APPOINTMENT_STATUSES = [
  'confirmed', // محجوز ومتأكد
  'checked_in', // وصل ومستني
  'in_progress', // مع الدكتور
  'completed', // خلص
  'no_show', // مجاش
  'cancelled',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// الدكتور أو الأخصائي في كالندر الفرع
export const practitionerSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  specialty,
});

export type Practitioner = z.infer<typeof practitionerSchema>;

export const roomSchema = z.object({
  id: z.string(),
  branch_id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
});

export type Room = z.infer<typeof roomSchema>;

// خدمة من الكتالوج (الحجز بيحتاج المدة والسعر)
export const serviceSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  specialty,
  duration_min: z.number(),
  // بالقروش
  price: z.number(),
});

export type Service = z.infer<typeof serviceSchema>;

// المريض في نتايج البحث وفي الميعاد
export const patientSummarySchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  file_no: z.string(),
  phone: z.string(),
  // فلوس متأخرة على المريض (بالقروش) — بتظهر للريسبشن عشان يحصّلها
  balance_due: z.number(),
});

export type PatientSummary = z.infer<typeof patientSummarySchema>;

export const appointmentSchema = z.object({
  id: z.string(),
  branch_id: z.string(),
  practitioner_id: z.string(),
  room_id: z.string(),
  patient: patientSummarySchema,
  service: serviceSchema.pick({ id: true, name_ar: true, name_en: true, specialty: true }),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.enum(APPOINTMENT_STATUSES),
  checked_in_at: z.string().nullable(),
  notes: z.string().nullable(),
  // الفاتورة اللي اتحصّل بيها الميعاد (null = لسه)
  invoice_id: z.string().nullable(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const TIME_BLOCK_REASONS = ['break', 'meeting', 'leave', 'other'] as const;
export type TimeBlockReason = (typeof TIME_BLOCK_REASONS)[number];

// وقت مقفول في جدول دكتور (استراحة، اجتماع…) — مفيش حجز فيه
export const timeBlockSchema = z.object({
  id: z.string(),
  branch_id: z.string(),
  practitioner_id: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  reason: z.enum(TIME_BLOCK_REASONS),
});

export type TimeBlock = z.infer<typeof timeBlockSchema>;

// الفترة: يوم واحد (from = to) أو أسبوع
export type RangeQuery = { branch_id: string; from: string; to: string };

export type CreateAppointmentBody = {
  branch_id: string;
  practitioner_id: string;
  patient_id: string;
  service_id: string;
  starts_at: string;
  notes?: string;
};

export type RescheduleBody = { id: string; starts_at: string; practitioner_id: string };

export const CANCEL_REASONS = [
  'patient_request',
  'practitioner_unavailable',
  'duplicate',
  'other',
] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

export type CreateTimeBlockBody = {
  branch_id: string;
  practitioner_id: string;
  starts_at: string;
  ends_at: string;
  reason: TimeBlockReason;
};
