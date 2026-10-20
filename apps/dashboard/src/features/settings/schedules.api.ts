import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  conflictsSchema,
  scheduleSchema,
  type AddLeaveBody,
  type DoctorSchedule,
  type LeaveConflictQuery,
  type RemoveLeaveBody,
  type SaveWeeklyBody,
} from './schedule-types';

/**
 * جداول الدكاترة والإجازات (9.5). 403 `FORBIDDEN` · 422 `INVALID_SCHEDULE` (من بعد إلى · تاريخ فاضي)
 */
export const schedulesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDoctorSchedules: build.query<DoctorSchedule[], void>({
      query: () => '/staff/doctor-schedules',
      rawResponseSchema: z.object({ data: z.array(scheduleSchema) }),
      transformResponse: (response: { data: DoctorSchedule[] }) => response.data,
      providesTags: ['Schedules'],
    }),
    saveWeekly: build.mutation<DoctorSchedule, SaveWeeklyBody>({
      query: ({ practitioner_id, ...body }) => ({
        url: `/staff/doctor-schedules/${practitioner_id}/weekly`,
        method: 'PUT',
        body,
      }),
      responseSchema: scheduleSchema,
      invalidatesTags: ['Schedules', 'Practitioners'],
    }),
    // كام موعد محجوز هيقع في الإجازة دي (قبل ما تتسجل)
    getLeaveConflicts: build.query<{ count: number }, LeaveConflictQuery>({
      query: ({ practitioner_id, ...params }) => ({
        url: `/staff/doctor-schedules/${practitioner_id}/leave-conflicts`,
        params,
      }),
      responseSchema: conflictsSchema,
    }),
    addLeave: build.mutation<DoctorSchedule, AddLeaveBody>({
      query: ({ practitioner_id, ...body }) => ({
        url: `/staff/doctor-schedules/${practitioner_id}/leaves`,
        method: 'POST',
        body,
      }),
      responseSchema: scheduleSchema,
      invalidatesTags: ['Schedules', 'Practitioners'],
    }),
    removeLeave: build.mutation<DoctorSchedule, RemoveLeaveBody>({
      query: ({ practitioner_id, leave_id }) => ({
        url: `/staff/doctor-schedules/${practitioner_id}/leaves/${leave_id}`,
        method: 'DELETE',
      }),
      responseSchema: scheduleSchema,
      invalidatesTags: ['Schedules', 'Practitioners'],
    }),
  }),
});

export const {
  useGetDoctorSchedulesQuery,
  useSaveWeeklyMutation,
  useGetLeaveConflictsQuery,
  useAddLeaveMutation,
  useRemoveLeaveMutation,
} = schedulesApi;
