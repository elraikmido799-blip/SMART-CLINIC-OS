import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  enrollmentSchema,
  type EnrollBody,
  type Enrollment,
  type MoveStageBody,
} from './enrollment-types';

const list = z.object({ data: z.array(enrollmentSchema) });
const unwrap = (response: { data: Enrollment[] }) => response.data;

/**
 * تسجيل المرضى في البرامج (5.2). 409 `ALREADY_ENROLLED` · 409 `PROGRAM_NOT_ACTIVE` · 422 `INVALID_STAGE`.
 * أي تسجيل أو نقل بيحدّث اللوحة وتاب "البرامج" في ملف المريض.
 */
export const enrollmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEnrollments: build.query<Enrollment[], { program_id: string; branch_id: string }>({
      query: (params) => ({ url: '/staff/program-enrollments', params }),
      rawResponseSchema: list,
      transformResponse: unwrap,
      providesTags: ['Enrollments'],
    }),
    getPatientEnrollments: build.query<Enrollment[], string>({
      query: (patientId) => `/staff/patients/${patientId}/program-enrollments`,
      rawResponseSchema: list,
      transformResponse: unwrap,
      providesTags: ['Enrollments'],
    }),
    enrollPatient: build.mutation<Enrollment, EnrollBody>({
      query: (body) => ({ url: '/staff/program-enrollments', method: 'POST', body }),
      responseSchema: enrollmentSchema,
      invalidatesTags: ['Enrollments', 'Programs'],
    }),
    moveEnrollmentStage: build.mutation<Enrollment, MoveStageBody>({
      query: ({ id, ...body }) => ({
        url: `/staff/program-enrollments/${id}/move`,
        method: 'POST',
        body,
      }),
      responseSchema: enrollmentSchema,
      invalidatesTags: ['Enrollments'],
    }),
  }),
});

export const {
  useGetEnrollmentsQuery,
  useGetPatientEnrollmentsQuery,
  useEnrollPatientMutation,
  useMoveEnrollmentStageMutation,
} = enrollmentsApi;
