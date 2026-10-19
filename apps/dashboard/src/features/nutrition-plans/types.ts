import { z } from 'zod';

export const MEAL_SLOTS = ['breakfast', 'snack_am', 'lunch', 'snack_pm', 'dinner'] as const;
export const GOAL_TYPES = ['lose', 'gain', 'maintain', 'clinical'] as const;

export type MealSlot = (typeof MEAL_SLOTS)[number];

/**
 * خطة التغذية (D-12 · docs/20 · 4.6): الهدف · الوجبات وبدايلها · ملاحظات. المتابعة بالوزن من الـOverview.
 * خطة واحدة لكل مريض، والـAPI بيرجّع الـ5 وجبات دايمًا (فاضية لو مفيش أكل).
 */
export const nutritionPlanSchema = z.object({
  patient_id: z.string(),
  goal: z.object({
    type: z.enum(GOAL_TYPES),
    target_weight_kg: z.number().nullable(),
    daily_kcal: z.number().nullable(),
  }),
  meals: z.array(
    z.object({
      slot: z.enum(MEAL_SLOTS),
      items: z.array(z.object({ id: z.string(), text: z.string(), alternative: z.string() })),
    }),
  ),
  notes: z.string(),
  updated_at: z.string().nullable(),
});

export type NutritionPlan = z.infer<typeof nutritionPlanSchema>;

export type NutritionPlanBody = Omit<NutritionPlan, 'updated_at'>;
