import { z } from 'zod';

/**
 * خطة العلاج الطبيعي (D-13 · docs/20 · 4.4): الأهداف · الجلسات في الأسبوع · إجمالي الجلسات · التمارين البيتية.
 * خطة واحدة لكل مريض (والتغذية والجلدية خطتهم في 4.6 · 4.7).
 */
export const carePlanSchema = z.object({
  patient_id: z.string(),
  goals: z.array(z.object({ id: z.string(), text: z.string(), achieved: z.boolean() })),
  sessions_per_week: z.number(),
  total_sessions: z.number(),
  exercises: z.array(
    z.object({
      exercise_id: z.string(),
      sets: z.number(),
      reps: z.number(),
    }),
  ),
  updated_at: z.string().nullable(),
});

export type CarePlan = z.infer<typeof carePlanSchema>;

export type CarePlanBody = Omit<CarePlan, 'updated_at'>;
