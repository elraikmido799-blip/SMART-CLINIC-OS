import { z } from 'zod';

// المريض اللي داخل (GET /me). الدخول برقم الموبايل + كود OTP (W-17)
export const meSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  phone: z.string(),
});
export type Me = z.infer<typeof meSchema>;

// POST /auth/otp: بيبعت الكود، وبيقول ينفع يتبعت تاني بعد كام ثانية
export const sendOtpResponseSchema = z.object({ resend_after_seconds: z.number().int() });

export type SendOtpBody = { phone: string };
// full_name: للمريض الجديد بس (من فورم الحجز). في صفحة الدخول مش بيتبعت
export type VerifyOtpBody = { phone: string; code: string; full_name?: string };
