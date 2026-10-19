import { z } from 'zod';
import { baseApi } from '@/store/base-api';

export const branchSchema = z.object({
  id: z.string(),
  name_ar: z.string(),
  name_en: z.string(),
});

export type Branch = z.infer<typeof branchSchema>;

// الفروع اللي الموظف يقدر يشوفها (الـAPI بيرجّع فروعه بس)
export const branchesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBranches: build.query<Branch[], void>({
      query: () => '/staff/branches',
      rawResponseSchema: z.object({ data: z.array(branchSchema) }),
      transformResponse: (response: { data: Branch[] }) => response.data,
      providesTags: ['Branches'],
    }),
  }),
});

export const { useGetBranchesQuery } = branchesApi;
