import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  programSchema,
  programSummarySchema,
  type Program,
  type ProgramBody,
  type ProgramSummary,
} from './types';

/**
 * البرامج (5.1). 403 `FORBIDDEN` · 409 `CODE_TAKEN` · 422 `INVALID_PROGRAM` لو ناقص.
 * تعديل المراحل مبيغيّرش مرحلة المرضى المسجّلين: اللي في مرحلة اتمسحت بيفضل فيها لحد ما الموظف ينقله (5.2).
 */
export const programsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPrograms: build.query<ProgramSummary[], void>({
      query: () => '/staff/programs',
      rawResponseSchema: z.object({ data: z.array(programSummarySchema) }),
      transformResponse: (response: { data: ProgramSummary[] }) => response.data,
      providesTags: ['Programs'],
    }),
    getProgram: build.query<Program, string>({
      query: (id) => `/staff/programs/${id}`,
      responseSchema: programSchema,
      providesTags: (_result, _error, id) => [{ type: 'Programs', id }],
    }),
    createProgram: build.mutation<Program, ProgramBody>({
      query: (body) => ({ url: '/staff/programs', method: 'POST', body }),
      responseSchema: programSchema,
      invalidatesTags: ['Programs'],
    }),
    updateProgram: build.mutation<Program, { id: string } & ProgramBody>({
      query: ({ id, ...body }) => ({ url: `/staff/programs/${id}`, method: 'PUT', body }),
      responseSchema: programSchema,
      invalidatesTags: (_result, _error, { id }) => ['Programs', { type: 'Programs', id }],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
} = programsApi;
