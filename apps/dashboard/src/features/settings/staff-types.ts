import { z } from 'zod';
import { isSpecialty, type Specialty } from '@oxygen/config';
import { PERMISSIONS, ROLES } from '@/features/auth/permissions';

/**
 * موظف في قايمة الإدارة (D-35 · docs/04 `staff`). `active: false` = الحساب مقفول (مبيدخلش ولا بيظهر في الحجز).
 * مدير الفرع بيشوف موظفين فرعه بس (06 §2)، والـAPI هو اللي بيحدد.
 */
export const staffMemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  role: z.enum(ROLES),
  branch_ids: z.array(z.string()),
  all_branches: z.boolean(),
  specialty: z.custom<Specialty>(isSpecialty).nullable(),
  active: z.boolean(),
});

export type StaffMember = z.infer<typeof staffMemberSchema>;

export type StaffBody = Omit<StaffMember, 'id'>;

export type UpdateStaffBody = { id: string } & StaffBody;

/** دور بصلاحياته (قالب بيعدّله الأدمن من غير كود — 06 §2) */
export const roleSchema = z.object({
  role: z.enum(ROLES),
  permissions: z.array(z.enum(PERMISSIONS)),
});

export type RoleEntry = z.infer<typeof roleSchema>;

export type UpdateRoleBody = RoleEntry;

/** الأدوار الطبية بس هي اللي ليها تخصص */
export const CLINICAL_ROLES = ['doctor', 'nutritionist', 'physiotherapist'] as const;
