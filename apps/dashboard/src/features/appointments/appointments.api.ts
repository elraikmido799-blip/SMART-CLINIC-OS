import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  appointmentSchema,
  patientSummarySchema,
  practitionerSchema,
  roomSchema,
  serviceSchema,
  timeBlockSchema,
  type Appointment,
  type CancelReason,
  type CreateAppointmentBody,
  type CreateTimeBlockBody,
  type PatientSummary,
  type Practitioner,
  type RangeQuery,
  type RescheduleBody,
  type Room,
  type Service,
  type TimeBlock,
} from './types';

const list = <T>(schema: z.ZodType<T>) => z.object({ data: z.array(schema) });
const unwrap = <T>(response: { data: T[] }) => response.data;

// أي تغيير في المواعيد بيحدّث الكالندر وشاشة اليوم وأرقامها
const CHANGES = ['Appointments', 'FrontDeskSummary'] as const;

/** المواعيد والدكاترة والأوض (شاشة اليوم 3.1 · الكالندر 3.2 · الطابور 3.4) */
export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // الدكاترة اللي شغالين في الفرع في الفترة دي
    getPractitioners: build.query<Practitioner[], RangeQuery>({
      query: (params) => ({ url: '/staff/practitioners', params }),
      rawResponseSchema: list(practitionerSchema),
      transformResponse: unwrap<Practitioner>,
      providesTags: ['Practitioners'],
    }),
    getRooms: build.query<Room[], { branch_id: string }>({
      query: (params) => ({ url: '/staff/rooms', params }),
      rawResponseSchema: list(roomSchema),
      transformResponse: unwrap<Room>,
    }),
    getServices: build.query<Service[], void>({
      query: () => '/staff/services',
      rawResponseSchema: list(serviceSchema),
      transformResponse: unwrap<Service>,
    }),
    // البحث بالاسم أو الموبايل أو رقم الملف (الحجز · بحث الـTop bar في 3.5)
    searchPatients: build.query<PatientSummary[], { q: string; limit?: number }>({
      query: ({ q, limit = 8 }) => ({ url: '/staff/patients', params: { q, limit } }),
      rawResponseSchema: list(patientSummarySchema),
      transformResponse: unwrap<PatientSummary>,
      providesTags: ['Patients'],
    }),
    getAppointments: build.query<Appointment[], RangeQuery>({
      query: (params) => ({ url: '/staff/appointments', params }),
      rawResponseSchema: list(appointmentSchema),
      transformResponse: unwrap<Appointment>,
      providesTags: ['Appointments'],
    }),
    getTimeBlocks: build.query<TimeBlock[], RangeQuery>({
      query: (params) => ({ url: '/staff/time-blocks', params }),
      rawResponseSchema: list(timeBlockSchema),
      transformResponse: unwrap<TimeBlock>,
      providesTags: ['TimeBlocks'],
    }),
    createAppointment: build.mutation<Appointment, CreateAppointmentBody>({
      query: (body) => ({ url: '/staff/appointments', method: 'POST', body }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    rescheduleAppointment: build.mutation<Appointment, RescheduleBody>({
      query: ({ id, ...body }) => ({ url: `/staff/appointments/${id}`, method: 'PATCH', body }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    cancelAppointment: build.mutation<Appointment, { id: string; reason: CancelReason }>({
      query: ({ id, reason }) => ({
        url: `/staff/appointments/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    markNoShow: build.mutation<Appointment, { id: string }>({
      query: ({ id }) => ({ url: `/staff/appointments/${id}/no-show`, method: 'POST' }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    checkIn: build.mutation<Appointment, { id: string }>({
      query: ({ id }) => ({ url: `/staff/appointments/${id}/check-in`, method: 'POST' }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    // وصل ← مع الدكتور (الريسبشن بيدخّله، أو الدكتور يبدأ الكشف في 4.3)
    startVisit: build.mutation<Appointment, { id: string }>({
      query: ({ id }) => ({ url: `/staff/appointments/${id}/start`, method: 'POST' }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    // مع الدكتور ← خلص
    completeVisit: build.mutation<Appointment, { id: string }>({
      query: ({ id }) => ({ url: `/staff/appointments/${id}/complete`, method: 'POST' }),
      responseSchema: appointmentSchema,
      invalidatesTags: [...CHANGES],
    }),
    createTimeBlock: build.mutation<TimeBlock, CreateTimeBlockBody>({
      query: (body) => ({ url: '/staff/time-blocks', method: 'POST', body }),
      responseSchema: timeBlockSchema,
      invalidatesTags: ['TimeBlocks'],
    }),
    deleteTimeBlock: build.mutation<null, { id: string }>({
      query: ({ id }) => ({ url: `/staff/time-blocks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TimeBlocks'],
    }),
  }),
});

export const {
  useGetPractitionersQuery,
  useGetRoomsQuery,
  useGetServicesQuery,
  useSearchPatientsQuery,
  useGetAppointmentsQuery,
  useGetTimeBlocksQuery,
  useCreateAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
  useMarkNoShowMutation,
  useCheckInMutation,
  useStartVisitMutation,
  useCompleteVisitMutation,
  useCreateTimeBlockMutation,
  useDeleteTimeBlockMutation,
} = appointmentsApi;
