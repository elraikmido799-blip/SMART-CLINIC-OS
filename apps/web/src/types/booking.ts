import { z } from 'zod';
import { specialtySchema } from './public';

/**
 * الحجز (W-07) والدفع (W-16) والبورتال (المواعيد). نفس شكل ردود الـAPI (ملف 15):
 * الفلوس بالقروش، والمواعيد ISO بتوقيت مصر، والاسم بلغتين.
 */

// clinic = زيارة في فرع · online = مكالمة فيديو (من غير فرع)
export const bookingModeSchema = z.enum(['clinic', 'online']);

// GET /public/slots: كل ميعاد في اليوم، ومين الدكتور اللي فاضي فيه (لو "أي دكتور" بيرجع أول واحد فاضي)
export const slotSchema = z.object({
  starts_at: z.iso.datetime({ offset: true }),
  doctor_slug: z.string(),
  available: z.boolean(),
});
export const slotsResponseSchema = z.object({
  data: z.array(slotSchema),
  // اليوم ده لو فيه ميعاد فاضي، وإلا أقرب يوم بعده فيه (null = مفيش خلال أسبوعين)
  next_available_date: z.iso.date().nullable(),
});

const namedSchema = { name_ar: z.string(), name_en: z.string() };

export const bookingSchema = z.object({
  id: z.string(),
  // الرقم اللي المريض بيقوله للريسبشن (OXY-4821)
  reference: z.string(),
  status: z.enum(['pending_payment', 'confirmed', 'completed', 'cancelled']),
  mode: bookingModeSchema,
  specialty: specialtySchema,
  service: z.object({ slug: z.string(), duration_minutes: z.number().int(), ...namedSchema }),
  branch: z
    .object({ id: z.string(), slug: z.string(), maps_url: z.url(), ...namedSchema })
    .nullable(),
  doctor: z.object({ slug: z.string(), photo_url: z.string().nullable(), ...namedSchema }),
  starts_at: z.iso.datetime({ offset: true }),
  price_minor: z.number().int().nonnegative(),
  discount_minor: z.number().int().nonnegative(),
  currency: z.string(),
  payment_method: z.enum(['clinic', 'online']),
  paid: z.boolean(),
  // لينك المكالمة في الأونلاين (بيتبعت كمان على واتساب)
  video_url: z.string().nullable(),
  program_slug: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.iso.datetime({ offset: true }),
});

export type BookingMode = z.infer<typeof bookingModeSchema>;
export type Slot = z.infer<typeof slotSchema>;
export type SlotsResponse = z.infer<typeof slotsResponseSchema>;
export type Booking = z.infer<typeof bookingSchema>;

export type SlotsQuery = {
  mode: BookingMode;
  specialty: string;
  // clinic بس
  service?: string;
  branch?: string;
  // من غير doctor = "أي دكتور متاح"
  doctor?: string;
  // "YYYY-MM-DD"
  date: string;
  // في التأجيل: الحجز نفسه مش بيتحسب مشغول
  exclude_booking?: string;
};

export type CreateBookingBody = {
  mode: BookingMode;
  specialty: string;
  service_slug: string | null;
  branch_id: string | null;
  doctor_slug: string;
  starts_at: string;
  payment_method: 'clinic' | 'online';
  program_slug: string | null;
  notes: string | null;
};
