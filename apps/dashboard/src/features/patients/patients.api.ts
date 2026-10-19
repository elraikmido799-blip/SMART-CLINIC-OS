import { patientSummarySchema, type PatientSummary } from '@/features/appointments/types';
import { baseApi } from '@/store/base-api';
import type { RegisterPatientBody } from './types';

/** المرضى: تسجيل سريع (3.3). البحث في appointments.api (searchPatients)، وملف المريض في 4.1 */
export const patientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 409 DUPLICATE_PHONE = الموبايل متسجل لمريض تاني
    registerPatient: build.mutation<PatientSummary, RegisterPatientBody>({
      query: (body) => ({ url: '/staff/patients', method: 'POST', body }),
      responseSchema: patientSummarySchema,
      invalidatesTags: ['Patients'],
    }),
  }),
});

export const { useRegisterPatientMutation } = patientsApi;
