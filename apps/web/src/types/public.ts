import { z } from 'zod';
import type { Specialty } from '@oxygen/config';

/**
 * شكل داتا الصفحات التعريفية زي ما الـAPI هيرجّعها (/public/*).
 * الـSchema بتتأكد من الرد قبل ما يوصل للصفحة: لو الباك رجّع شكل غلط، القسم بيظهر رسالة بدل ما الصفحة تقع.
 * اللي ليه لغتين بيرجع _ar و _en، والفلوس بالقروش (ملف 15).
 */

const specialtySchema = z.enum([
  'nutrition',
  'physio',
  'derm',
  'internal',
]) satisfies z.ZodType<Specialty>;

export const publicSpecialtySchema = z.object({
  id: z.string(),
  slug: specialtySchema,
  name_ar: z.string(),
  name_en: z.string(),
  summary_ar: z.string(),
  summary_en: z.string(),
  icon_url: z.string(),
});

export const publicDoctorSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  specialty: specialtySchema,
  years_of_experience: z.number().int().nonnegative(),
  branch_ids: z.array(z.string()),
  // الصورة بتتغير من الداشبورد (DEC-25). null = لسه مفيش صورة
  photo_url: z.string().nullable(),
});

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/);

export const publicBranchSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  // "HH:mm" بتوقيت الفرع
  opens_at: timeSchema,
  closes_at: timeSchema,
  // لينك الفرع على Google Maps (DEC-28) + مكانه عشان الخريطة
  maps_url: z.url(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const publicProgramSchema = z.object({
  id: z.string(),
  specialty: specialtySchema,
  name_ar: z.string(),
  name_en: z.string(),
  features_ar: z.array(z.string()),
  features_en: z.array(z.string()),
  price_from_minor: z.number().int().nonnegative(),
  currency: z.string(),
});

// محتوى الصفحة الرئيسية اللي بيتغير من الداشبورد
export const homeContentSchema = z.object({
  hero_image_url: z.string(),
  stats: z.object({
    specialties: z.number().int().nonnegative(),
    branches: z.number().int().nonnegative(),
    specialists: z.number().int().nonnegative(),
    patients: z.number().int().nonnegative(),
  }),
});

export type PublicSpecialty = z.infer<typeof publicSpecialtySchema>;
export type PublicDoctor = z.infer<typeof publicDoctorSchema>;
export type PublicBranch = z.infer<typeof publicBranchSchema>;
export type PublicProgram = z.infer<typeof publicProgramSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type ListResponse<T> = { data: T[] };
