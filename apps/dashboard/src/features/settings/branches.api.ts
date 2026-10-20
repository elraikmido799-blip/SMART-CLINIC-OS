import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import { branchSettingsSchema, type BranchSettings, type UpdateBranchBody } from './branch-types';

/**
 * إعدادات الفروع (9.4). 403 `FORBIDDEN` · 422 `INVALID_BRANCH` (اسم ناقص · ساعة الفتح بعد الإغلاق · أوضة من غير اسم)
 */
export const branchSettingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBranchSettings: build.query<BranchSettings[], void>({
      query: () => '/staff/branch-settings',
      rawResponseSchema: z.object({ data: z.array(branchSettingsSchema) }),
      transformResponse: (response: { data: BranchSettings[] }) => response.data,
      providesTags: ['BranchSettings'],
    }),
    updateBranchSettings: build.mutation<BranchSettings, UpdateBranchBody>({
      query: ({ id, ...body }) => ({ url: `/staff/branch-settings/${id}`, method: 'PUT', body }),
      responseSchema: branchSettingsSchema,
      // أسماء الفروع بتظهر في كل الشاشات
      invalidatesTags: ['BranchSettings', 'Branches'],
    }),
  }),
});

export const { useGetBranchSettingsQuery, useUpdateBranchSettingsMutation } = branchSettingsApi;
