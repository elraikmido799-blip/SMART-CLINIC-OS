import { z } from 'zod';

/**
 * خطة العلاج الجلدي (D-14 · docs/20 · 4.7): الإجراءات (ليزر · بيلينج…) وعدد جلسات كل واحد واللي اتعمل منها + ملاحظات.
 * خطة واحدة لكل مريض، والـAPI بيرجّع خطة فاضية لو مفيش.
 */
export const dermPlanSchema = z.object({
  patient_id: z.string(),
  procedures: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sessions_total: z.number(),
      sessions_done: z.number(),
    }),
  ),
  notes: z.string(),
  updated_at: z.string().nullable(),
});

export type DermPlan = z.infer<typeof dermPlanSchema>;

export type DermPlanBody = Omit<DermPlan, 'updated_at'>;
