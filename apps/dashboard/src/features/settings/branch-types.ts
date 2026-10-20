import { z } from 'zod';

/** يوم الأسبوع: 0 = السبت لحد 6 = الجمعة (أسبوع العمل في مصر) */
export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * فرع بإعداداته (D-36 · docs/04 `branches`): البيانات اللي بتظهر للمريض في الموقع، ومواعيد العمل في الأسبوع، والأوض.
 * الأوضة المقفولة (`active: false`) مبتتحجزش، وبتفضل في التاريخ (مفيش حذف).
 */
export const branchSettingsSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  address_ar: z.string(),
  address_en: z.string(),
  phone: z.string(),
  map_url: z.string(),
  active: z.boolean(),
  hours: z.array(
    z.object({
      day: z.number(),
      closed: z.boolean(),
      // "09:00" لـ"21:00"
      open: z.string(),
      close: z.string(),
    }),
  ),
  rooms: z.array(
    z.object({
      id: z.string(),
      name_ar: z.string(),
      name_en: z.string(),
      active: z.boolean(),
    }),
  ),
});

export type BranchSettings = z.infer<typeof branchSettingsSchema>;

export type UpdateBranchBody = BranchSettings;
