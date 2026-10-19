import { z } from 'zod';
import { patientSummarySchema, type PatientSummary } from '@/features/appointments/types';
import { baseApi } from '@/store/base-api';
import type { RegisterPatientBody } from './types';

// ملف المريض (الهيدر دلوقتي، والـ360 كله في 4.1)
export const patientDetailSchema = patientSummarySchema.extend({
  gender: z.enum(['female', 'male']),
  birth_date: z.string().nullable(),
  branch_id: z.string(),
});

export type PatientDetail = z.infer<typeof patientDetailSchema>;

/** المرضى: الملف (3.5 · 4.1) والتسجيل السريع (3.3). البحث في appointments.api (searchPatients) */
export const patientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 404 = المريض مش موجود (أو مش في صلاحياتك)
    getPatient: build.query<PatientDetail, string>({
      query: (id) => `/staff/patients/${id}`,
      responseSchema: patientDetailSchema,
      providesTags: ['Patients'],
    }),
    // 409 DUPLICATE_PHONE = الموبايل متسجل لمريض تاني
    registerPatient: build.mutation<PatientSummary, RegisterPatientBody>({
      query: (body) => ({ url: '/staff/patients', method: 'POST', body }),
      responseSchema: patientSummarySchema,
      invalidatesTags: ['Patients'],
    }),
  }),
});

export const { useGetPatientQuery, useRegisterPatientMutation } = patientsApi;
