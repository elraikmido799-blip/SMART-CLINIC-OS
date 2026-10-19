import { baseApi } from '@/store/base-api';
import { carePlanSchema, type CarePlan, type CarePlanBody } from './types';

/** خطة العلاج الطبيعي للمريض. لو مفيش خطة بيرجّع خطة فاضية (مش 404). الحفظ بيبدّل الخطة كلها */
export const carePlansApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCarePlan: build.query<CarePlan, string>({
      query: (patientId) => `/staff/patients/${patientId}/care-plan`,
      responseSchema: carePlanSchema,
      providesTags: (_result, _error, patientId) => [{ type: 'CarePlans', id: patientId }],
    }),
    // مش بيلغي الـCache: الخطة بتتحفظ وهي بتتكتب (الشاشة هي اللي ماسكة القيم)
    saveCarePlan: build.mutation<CarePlan, CarePlanBody>({
      query: (body) => ({
        url: `/staff/patients/${body.patient_id}/care-plan`,
        method: 'PUT',
        body,
      }),
      responseSchema: carePlanSchema,
    }),
  }),
});

export const { useGetCarePlanQuery, useSaveCarePlanMutation } = carePlansApi;
