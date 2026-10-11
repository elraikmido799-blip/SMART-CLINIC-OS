import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  myInvoicesSchema,
  profileSchema,
  type Invoice,
  type Profile,
  type UpdateProfileBody,
} from '@/types/portal';

/** الفواتير (PP-07) + البروفايل والخصوصية (PP-08): البيانات · الموافقات · تصدير البيانات · حذف الحساب. */
export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // بتتحسب من الحجوزات، فبتتحدث مع أي دفع أو إلغاء
    getMyInvoices: build.query<Invoice[], void>({
      query: () => '/me/invoices',
      rawResponseSchema: myInvoicesSchema,
      transformResponse: (response: { data: Invoice[] }) => response.data,
      providesTags: ['Appointments'],
    }),
    getProfile: build.query<Profile, void>({
      query: () => '/me/profile',
      responseSchema: profileSchema,
      providesTags: ['Profile'],
    }),
    updateProfile: build.mutation<Profile, UpdateProfileBody>({
      query: (body) => ({ url: '/me/profile', method: 'PATCH', body }),
      responseSchema: profileSchema,
      invalidatesTags: ['Profile', 'Me'],
    }),
    // بيتبعت للمريض على الموبايل/الإيميل خلال 48 ساعة
    requestDataExport: build.mutation<{ requested_at: string }, void>({
      query: () => ({ url: '/me/export', method: 'POST' }),
      responseSchema: z.object({ requested_at: z.string() }),
    }),
    deleteMyAccount: build.mutation<null, void>({
      query: () => ({ url: '/me', method: 'DELETE' }),
      invalidatesTags: ['Me', 'Appointments', 'Documents', 'Profile'],
    }),
  }),
});

export const {
  useGetMyInvoicesQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRequestDataExportMutation,
  useDeleteMyAccountMutation,
} = accountApi;
