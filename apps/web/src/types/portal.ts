import { z } from 'zod';
import { bookingSchema } from './booking';
import { specialtySchema } from './public';

/**
 * بوابة المريض (المرحلة 6 · PP-01 → PP-08). كل حاجة هنا بتاعة المريض اللي داخل (/me/*).
 * نفس قواعد ملف 15: الاسم بلغتين، والفلوس بالقروش، والتواريخ ISO.
 */

const titleSchema = { title_ar: z.string(), title_en: z.string() };

// GET /me/bookings — الجاية واللي فاتت (الجديد الأول)
export const myBookingsSchema = z.object({ data: z.array(bookingSchema) });

// GET /me/program — البرنامج اللي المريض فيه (Secret Seven): المرحلة الحالية من 7
export const myProgramSchema = z.object({
  slug: z.string(),
  ...titleSchema,
  stage: z.number().int().min(1),
  total_stages: z.number().int().min(1),
  stage_title_ar: z.string(),
  stage_title_en: z.string(),
});

// GET /me/packages — الباقات (جلسات مدفوعة مقدمًا)
export const packageSchema = z.object({
  id: z.string(),
  specialty: specialtySchema,
  ...titleSchema,
  total_sessions: z.number().int().positive(),
  used_sessions: z.number().int().nonnegative(),
  expires_at: z.iso.date(),
  status: z.enum(['active', 'expired', 'finished']),
});
export const myPackagesSchema = z.object({ data: z.array(packageSchema) });

// GET /me/passport — القياسات (للرسم) + الخط الزمني
export const measurementSchema = z.object({
  date: z.iso.date(),
  weight_kg: z.number(),
  body_fat_pct: z.number().nullable(),
  waist_cm: z.number().nullable(),
});
export const timelineEntrySchema = z.object({
  id: z.string(),
  date: z.iso.date(),
  specialty: specialtySchema,
  kind: z.enum(['visit', 'measurement', 'plan', 'document', 'note']),
  ...titleSchema,
  body_ar: z.string(),
  body_en: z.string(),
});
export const passportSchema = z.object({
  goal_weight_kg: z.number().nullable(),
  measurements: z.array(measurementSchema),
  timeline: z.array(timelineEntrySchema),
});

// GET /me/documents — الملفات. preview = اللي بيظهر في المعاينة (سطور: اسم وقيمة)
export const documentSchema = z.object({
  id: z.string(),
  kind: z.enum(['lab', 'imaging', 'plan', 'prescription', 'report', 'upload']),
  specialty: specialtySchema.nullable(),
  ...titleSchema,
  date: z.iso.date(),
  size_kb: z.number().int(),
  // رفعه المريض (من الفورم) ولا من العيادة
  uploaded_by_patient: z.boolean(),
  preview: z.array(z.object({ label_ar: z.string(), label_en: z.string(), value: z.string() })),
});
export const myDocumentsSchema = z.object({ data: z.array(documentSchema) });

// GET /me/plans — خطة لكل تخصص: وجبات (تغذية) أو تمارين (علاج طبيعي)
export const planItemSchema = z.object({
  id: z.string(),
  ...titleSchema,
  detail_ar: z.string(),
  detail_en: z.string(),
  // فيديو التمرين من الأخصائي. null = لسه متصورش
  video_url: z.string().nullable(),
});
export const planSchema = z.object({
  id: z.string(),
  specialty: specialtySchema,
  kind: z.enum(['meals', 'exercises', 'care']),
  ...titleSchema,
  doctor_name_ar: z.string(),
  doctor_name_en: z.string(),
  updated_at: z.iso.date(),
  items: z.array(planItemSchema),
});
export const myPlansSchema = z.object({ data: z.array(planSchema) });

// GET /me/invoices
export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  date: z.iso.date(),
  ...titleSchema,
  amount_minor: z.number().int(),
  currency: z.string(),
  status: z.enum(['paid', 'unpaid', 'refunded']),
  booking_id: z.string().nullable(),
});
export const myInvoicesSchema = z.object({ data: z.array(invoiceSchema) });

// GET /me/profile · PATCH /me/profile
export const consentsSchema = z.object({
  reminders_whatsapp: z.boolean(),
  offers_whatsapp: z.boolean(),
  offers_sms: z.boolean(),
  progress_photos: z.boolean(),
});
export const profileSchema = z.object({
  full_name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  birth_date: z.iso.date().nullable(),
  gender: z.enum(['female', 'male']).nullable(),
  consents: consentsSchema,
});

export type MyProgram = z.infer<typeof myProgramSchema>;
export type Package = z.infer<typeof packageSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Passport = z.infer<typeof passportSchema>;
export type PatientDocument = z.infer<typeof documentSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type Consents = z.infer<typeof consentsSchema>;
export type Profile = z.infer<typeof profileSchema>;

export type RescheduleBody = { id: string; starts_at: string; doctor_slug: string };
export type UploadDocumentBody = { title: string; size_kb: number };
export type UpdateProfileBody = Partial<Omit<Profile, 'phone' | 'consents'>> & {
  consents?: Partial<Consents>;
};
