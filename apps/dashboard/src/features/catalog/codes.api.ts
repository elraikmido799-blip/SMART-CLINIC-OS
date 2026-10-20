import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  discountCodeSchema,
  type DiscountCode,
  type DiscountCodeBody,
  type UpdateDiscountCodeBody,
} from './codes-types';

/** أكواد الخصم (7.2). 409 `DUPLICATE_CODE` · 422 `INVALID_CODE_DATA` · 403 `FORBIDDEN` */
export const codesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDiscountCodes: build.query<DiscountCode[], void>({
      query: () => '/staff/discount-codes',
      rawResponseSchema: z.object({ data: z.array(discountCodeSchema) }),
      transformResponse: (response: { data: DiscountCode[] }) => response.data,
      providesTags: ['DiscountCodes'],
    }),
    createDiscountCode: build.mutation<DiscountCode, DiscountCodeBody>({
      query: (body) => ({ url: '/staff/discount-codes', method: 'POST', body }),
      responseSchema: discountCodeSchema,
      invalidatesTags: ['DiscountCodes'],
    }),
    updateDiscountCode: build.mutation<DiscountCode, UpdateDiscountCodeBody>({
      query: ({ id, ...body }) => ({ url: `/staff/discount-codes/${id}`, method: 'PUT', body }),
      responseSchema: discountCodeSchema,
      invalidatesTags: ['DiscountCodes'],
    }),
  }),
});

export const {
  useGetDiscountCodesQuery,
  useCreateDiscountCodeMutation,
  useUpdateDiscountCodeMutation,
} = codesApi;
