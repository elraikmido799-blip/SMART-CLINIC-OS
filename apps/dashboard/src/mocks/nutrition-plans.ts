import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import {
  MEAL_SLOTS,
  type NutritionPlan,
  type NutritionPlanBody,
} from '@/features/nutrition-plans/types';
import { currentStaff } from './auth';
import { readDb, writeDb } from './db';

/** خطط التغذية الوهمية (4.6): خطة فاضية بالـ5 وجبات لحد أول حفظ، وبعدها بتتخزن في الـMock DB */
const idFrom = (url: string, fromEnd: number) => url.split('/').at(-fromEnd) ?? '';

export const nutritionPlanHandlers: MockHandlers = {
  getNutritionPlan: ({ url }) => {
    const patientId = idFrom(url, 2);
    const stored = readDb().nutrition_plans.find((item) => item.patient_id === patientId);
    if (stored) return stored;
    const empty: NutritionPlan = {
      patient_id: patientId,
      goal: { type: 'lose', target_weight_kg: null, daily_kcal: 1600 },
      meals: MEAL_SLOTS.map((slot) => ({ slot, items: [] })),
      notes: '',
      updated_at: null,
    };
    return empty;
  },

  saveNutritionPlan: ({ url, body }) => {
    if (!currentStaff().specialty) throw new MockHttpError(403, 'FORBIDDEN');
    const patientId = idFrom(url, 2);
    const plan: NutritionPlan = {
      ...(body as NutritionPlanBody),
      patient_id: patientId,
      updated_at: new Date().toISOString(),
    };
    writeDb((db) => {
      db.nutrition_plans = [
        ...db.nutrition_plans.filter((item) => item.patient_id !== patientId),
        plan,
      ];
    });
    return plan;
  },
};
