import { z } from 'zod';

// المنطقة اللي التمرين بيشتغل عليها (فلتر المكتبة)
export const EXERCISE_REGIONS = [
  'knee',
  'back',
  'neck',
  'shoulder',
  'hip',
  'ankle',
  'core',
] as const;

export type ExerciseRegion = (typeof EXERCISE_REGIONS)[number];

// تمرين في مكتبة التمارين (D-16 · docs/20 · 4.5): بالغتين، والفيديو أو الصورة اختياري
export const exerciseSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
  region: z.enum(EXERCISE_REGIONS),
  instructions_ar: z.string(),
  instructions_en: z.string(),
  media_url: z.string().nullable(),
  // التمرين المقفول مش بيظهر في اختيار الخطة، لكن الخطط القديمة بتفضل شايفاه
  active: z.boolean(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export type ExerciseBody = Omit<Exercise, 'id'>;

export type ExerciseQuery = { q?: string; region?: ExerciseRegion; include_inactive?: boolean };
