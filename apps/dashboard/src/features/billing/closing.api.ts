import { baseApi } from '@/store/base-api';
import { cashClosingSchema, type CashClosing, type CloseCashBody } from './types';

/** تقفيل الخزنة (3.7): اللي اتحصّل في اليوم + التقفيل نفسه */
export const closingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCashClosing: build.query<CashClosing, { branch_id: string; date: string }>({
      query: (params) => ({ url: '/staff/cash-closing', params }),
      responseSchema: cashClosingSchema,
      providesTags: ['CashClosing'],
    }),
    // 422 REASON_REQUIRED (فيه فرق من غير سبب) · 409 ALREADY_CLOSED
    closeCash: build.mutation<CashClosing, CloseCashBody>({
      query: (body) => ({ url: '/staff/cash-closing', method: 'POST', body }),
      responseSchema: cashClosingSchema,
      invalidatesTags: ['CashClosing'],
    }),
  }),
});

export const { useGetCashClosingQuery, useCloseCashMutation } = closingApi;
