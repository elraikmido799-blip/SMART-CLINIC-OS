import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  myPackagesSchema,
  myPlansSchema,
  myProgramSchema,
  passportSchema,
  type MyProgram,
  type Package,
  type Passport,
  type Plan,
} from '@/types/portal';

/** رعاية المريض: البرنامج (Secret Seven) · الباقات (PP-06) · الـPassport (PP-03) · الخطط (PP-05). قراية بس. */
export const careApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // null = مش في برنامج
    getMyProgram: build.query<MyProgram | null, void>({
      query: () => '/me/program',
      rawResponseSchema: z.object({ data: myProgramSchema.nullable() }),
      transformResponse: (response: { data: MyProgram | null }) => response.data,
      providesTags: ['Profile'],
    }),
    getMyPackages: build.query<Package[], void>({
      query: () => '/me/packages',
      rawResponseSchema: myPackagesSchema,
      transformResponse: (response: { data: Package[] }) => response.data,
      providesTags: ['Appointments'],
    }),
    getPassport: build.query<Passport, void>({
      query: () => '/me/passport',
      responseSchema: passportSchema,
      providesTags: ['Profile'],
    }),
    getMyPlans: build.query<Plan[], void>({
      query: () => '/me/plans',
      rawResponseSchema: myPlansSchema,
      transformResponse: (response: { data: Plan[] }) => response.data,
      providesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetMyProgramQuery,
  useGetMyPackagesQuery,
  useGetPassportQuery,
  useGetMyPlansQuery,
} = careApi;
