import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  appointmentSchema,
  practitionerSchema,
  type Appointment,
  type DayQuery,
  type Practitioner,
} from './types';

/** المواعيد والدكاترة (شاشة اليوم 3.1 والكالندر 3.2 والطابور 3.4) */
export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // الدكاترة اللي شغالين في الفرع في اليوم ده
    getPractitioners: build.query<Practitioner[], DayQuery>({
      query: (params) => ({ url: '/staff/practitioners', params }),
      rawResponseSchema: z.object({ data: z.array(practitionerSchema) }),
      transformResponse: (response: { data: Practitioner[] }) => response.data,
      providesTags: ['Practitioners'],
    }),
    getAppointments: build.query<Appointment[], DayQuery>({
      query: (params) => ({ url: '/staff/appointments', params }),
      rawResponseSchema: z.object({ data: z.array(appointmentSchema) }),
      transformResponse: (response: { data: Appointment[] }) => response.data,
      providesTags: ['Appointments'],
    }),
    checkIn: build.mutation<Appointment, { id: string }>({
      query: ({ id }) => ({ url: `/staff/appointments/${id}/check-in`, method: 'POST' }),
      responseSchema: appointmentSchema,
      invalidatesTags: ['Appointments', 'FrontDeskSummary'],
    }),
  }),
});

export const { useGetPractitionersQuery, useGetAppointmentsQuery, useCheckInMutation } =
  appointmentsApi;
