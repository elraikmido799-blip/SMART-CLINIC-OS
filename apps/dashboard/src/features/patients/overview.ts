import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';
import { APPOINTMENT_STATUSES } from '@/features/appointments/types';

/**
 * ملف المريض 360 (D-09 · docs/20 · 4.1): التنبيهات + الـOverview.
 * الأجزاء الطبية (الوزن · العلامات الحيوية · الخطط · الحساسية) بترجع فاضية من الـAPI لو الموظف معندوش `medical.read`.
 */
const specialty = z.custom<Specialty>(isSpecialty);
const named = { name_ar: z.string(), name_en: z.string() };

export const JOURNEY_STEPS = [
  'lead',
  'booked',
  'visited',
  'assessment',
  'program',
  'paid',
  'treatment',
] as const;

export const DOCUMENT_CATEGORIES = ['lab', 'plan', 'report', 'clinical', 'consent', 'id'] as const;

export const patientOverviewSchema = z.object({
  alerts: z.object({
    allergies: z.array(z.object(named)),
    // البرنامج والمرحلة (سيكرت سفن — المرحلة 3)
    program: z.object({ ...named, stage: z.number() }).nullable(),
    // الجلسات الباقية في الباقة
    sessions_left: z.number().nullable(),
  }),
  // آخر 12 أسبوع (كجم)
  weight: z.array(z.object({ date: z.string(), kg: z.number() })),
  vitals: z
    .object({
      measured_at: z.string(),
      systolic: z.number(),
      diastolic: z.number(),
      heart_rate: z.number(),
      bmi: z.number(),
    })
    .nullable(),
  plans: z.array(
    z.object({
      id: z.string(),
      specialty,
      ...named,
      starts_on: z.string(),
      ends_on: z.string(),
      home_exercises: z.boolean(),
    }),
  ),
  upcoming: z.array(
    z.object({
      id: z.string(),
      starts_at: z.string(),
      specialty,
      practitioner_name_ar: z.string(),
      practitioner_name_en: z.string(),
      service_name_ar: z.string(),
      service_name_en: z.string(),
      status: z.enum(APPOINTMENT_STATUSES),
    }),
  ),
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      category: z.enum(DOCUMENT_CATEGORIES),
      date: z.string(),
    }),
  ),
  journey: z.array(z.object({ step: z.enum(JOURNEY_STEPS), date: z.string().nullable() })),
  next_step: z.object(named).nullable(),
});

export type PatientOverview = z.infer<typeof patientOverviewSchema>;
