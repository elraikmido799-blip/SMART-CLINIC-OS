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

export const appointmentSchema = z.object({
  id: z.string(),
  branch_id: z.string(),
  practitioner_id: z.string(),
  patient: z.object({
    id: z.string(),
    name_ar: z.string(),
    name_en: z.string(),
    file_no: z.string(),
    phone: z.string(),
    // فلوس متأخرة على المريض (بالقروش) — بتظهر للريسبشن عشان يحصّلها
    balance_due: z.number(),
  }),
  service: z.object({
    id: z.string(),
    name_ar: z.string(),
    name_en: z.string(),
    specialty,
  }),
  starts_at: z.string(),
  ends_at: z.string(),
  status: z.enum(APPOINTMENT_STATUSES),
  checked_in_at: z.string().nullable(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export type DayQuery = { branch_id: string; date: string };
