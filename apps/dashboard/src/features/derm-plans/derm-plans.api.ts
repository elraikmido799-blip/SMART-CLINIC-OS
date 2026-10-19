import { baseApi } from '@/store/base-api';
import { dermPlanSchema, type DermPlan, type DermPlanBody } from './types';

/** خطة العلاج الجلدي للمريض. لو مفيش خطة بيرجّع خطة فاضية (مش 404). الحفظ بيبدّل الخطة كلها */
export const dermPlansApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDermPlan: build.query<DermPlan, string>({
      query: (patientId) => `/staff/patients/${patientId}/derm-plan`,
      responseSchema: dermPlanSchema,
      providesTags: (_result, _error, patientId) => [{ type: 'DermPlans', id: patientId }],
    }),
    // مش بيلغي الـCache: الشاشة هي اللي ماسكة القيم وهي بتتكتب
    saveDermPlan: build.mutation<DermPlan, DermPlanBody>({
      query: (body) => ({
        url: `/staff/patients/${body.patient_id}/derm-plan`,
        method: 'PUT',
        body,
      }),
      responseSchema: dermPlanSchema,
    }),
  }),
});

export const { useGetDermPlanQuery, useSaveDermPlanMutation } = dermPlansApi;
