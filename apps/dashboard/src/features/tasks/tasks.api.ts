import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  taskSchema,
  type CreateTaskBody,
  type SetTaskDoneBody,
  type Task,
  type TaskQuery,
} from './types';

/** المهام (6.3). 403 `FORBIDDEN` · 422 `INVALID_TASK` (العنوان أو اليوم ناقص) */
export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], TaskQuery>({
      query: (params) => ({ url: '/staff/tasks', params }),
      rawResponseSchema: z.object({ data: z.array(taskSchema) }),
      transformResponse: (response: { data: Task[] }) => response.data,
      providesTags: ['Tasks'],
    }),
    createTask: build.mutation<Task, CreateTaskBody>({
      query: (body) => ({ url: '/staff/tasks', method: 'POST', body }),
      responseSchema: taskSchema,
      invalidatesTags: ['Tasks'],
    }),
    // خلصت أو رجّعها مفتوحة
    setTaskDone: build.mutation<Task, SetTaskDoneBody>({
      query: ({ id, done }) => ({
        url: `/staff/tasks/${id}/done`,
        method: 'POST',
        body: { done },
      }),
      responseSchema: taskSchema,
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation, useSetTaskDoneMutation } = tasksApi;
