import { baseApi } from '@/store/base-api';
import { nutritionPlanSchema, type NutritionPlan, type NutritionPlanBody } from './types';

/** خطة التغذية للمريض. لو مفيش خطة بيرجّع خطة فاضية (مش 404). الحفظ بيبدّل الخطة كلها */
export const nutritionPlansApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNutritionPlan: build.query<NutritionPlan, string>({
      query: (patientId) => `/staff/patients/${patientId}/nutrition-plan`,
      responseSchema: nutritionPlanSchema,
      providesTags: (_result, _error, patientId) => [{ type: 'NutritionPlans', id: patientId }],
    }),
    // مش بيلغي الـCache: الشاشة هي اللي ماسكة القيم وهي بتتكتب
    saveNutritionPlan: build.mutation<NutritionPlan, NutritionPlanBody>({
      query: (body) => ({
        url: `/staff/patients/${body.patient_id}/nutrition-plan`,
        method: 'PUT',
        body,
      }),
      responseSchema: nutritionPlanSchema,
    }),
  }),
});

export const { useGetNutritionPlanQuery, useSaveNutritionPlanMutation } = nutritionPlansApi;
