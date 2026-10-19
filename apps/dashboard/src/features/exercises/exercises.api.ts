import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import { exerciseSchema, type Exercise, type ExerciseBody, type ExerciseQuery } from './types';

/** مكتبة التمارين (4.4 بيختار منها · 4.5 بيديرها). 422 `INVALID_NAME` لو الاسم فاضي */
export const exercisesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExercises: build.query<Exercise[], ExerciseQuery | void>({
      query: (params) => ({ url: '/staff/exercises', params: params ?? undefined }),
      rawResponseSchema: z.object({ data: z.array(exerciseSchema) }),
      transformResponse: (response: { data: Exercise[] }) => response.data,
      providesTags: ['Exercises'],
    }),
    createExercise: build.mutation<Exercise, ExerciseBody>({
      query: (body) => ({ url: '/staff/exercises', method: 'POST', body }),
      responseSchema: exerciseSchema,
      invalidatesTags: ['Exercises'],
    }),
    updateExercise: build.mutation<Exercise, { id: string } & ExerciseBody>({
      query: ({ id, ...body }) => ({ url: `/staff/exercises/${id}`, method: 'PATCH', body }),
      responseSchema: exerciseSchema,
      invalidatesTags: ['Exercises'],
    }),
  }),
});

export const { useGetExercisesQuery, useCreateExerciseMutation, useUpdateExerciseMutation } =
  exercisesApi;
