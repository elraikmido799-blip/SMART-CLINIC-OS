import { z } from 'zod';
import { baseApi } from '@/store/base-api';

// "مستني منك" في يوم الدكتور (D-10): ملاحظات مش متوقّعة · تقارير للمراجعة · رسايل المرضى
export const doctorPendingSchema = z.object({
  unsigned_notes: z.number(),
  reports_to_review: z.number(),
  unread_messages: z.number(),
});

export type DoctorPending = z.infer<typeof doctorPendingSchema>;

export const doctorDayApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctorPending: build.query<DoctorPending, void>({
      query: () => '/staff/me/pending',
      responseSchema: doctorPendingSchema,
      providesTags: ['Appointments'],
    }),
  }),
});

export const { useGetDoctorPendingQuery } = doctorDayApi;
