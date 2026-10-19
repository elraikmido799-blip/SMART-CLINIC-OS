import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';
import { PERMISSIONS, ROLES } from './permissions';

// الموظف اللي داخل (GET /me) — نفس شكل رد الـAPI
export const staffMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  role: z.enum(ROLES),
  permissions: z.array(z.enum(PERMISSIONS)),
  // الفروع اللي يشتغل عليها · all_branches = كل الفروع (الـCEO مثلًا)
  branch_ids: z.array(z.string()),
  all_branches: z.boolean(),
  // الدكاترة والأخصائيين بس
  specialty: z.custom<Specialty>(isSpecialty).nullable(),
});

export type StaffMe = z.infer<typeof staffMeSchema>;

export type LoginBody = { email: string; password: string };

// الخطوة الأولى: لو الجهاز مش متسجل كـ"موثوق"، الرد فيه التحقق بخطوتين
export const loginResponseSchema = z.object({
  two_factor: z
    .object({
      challenge_id: z.string(),
      masked_email: z.string(),
      resend_after_seconds: z.number(),
    })
    .nullable(),
  me: staffMeSchema.nullable(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export type VerifyTwoFactorBody = {
  challenge_id: string;
  code: string;
  remember_device: boolean;
};

export const resendResponseSchema = z.object({ resend_after_seconds: z.number() });
