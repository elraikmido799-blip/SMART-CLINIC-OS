import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  refundSchema,
  type DecideRefundBody,
  type Refund,
  type RefundQuery,
  type RequestRefundBody,
} from './refunds-types';

/**
 * المرتجعات (7.4). 403 `FORBIDDEN` · 422 `REFUND_TOO_HIGH` (أكتر من المتاح) · `REASON_REQUIRED` ·
 * 409 `ALREADY_DECIDED` (حد قرر قبلك)
 */
export const refundsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRefunds: build.query<Refund[], RefundQuery>({
      query: (params) => ({ url: '/staff/refunds', params }),
      rawResponseSchema: z.object({ data: z.array(refundSchema) }),
      transformResponse: (response: { data: Refund[] }) => response.data,
      providesTags: ['Refunds'],
    }),
    requestRefund: build.mutation<Refund, RequestRefundBody>({
      query: (body) => ({ url: '/staff/refunds', method: 'POST', body }),
      responseSchema: refundSchema,
      invalidatesTags: ['Refunds'],
    }),
    decideRefund: build.mutation<Refund, DecideRefundBody>({
      query: ({ id, ...body }) => ({ url: `/staff/refunds/${id}/decision`, method: 'POST', body }),
      responseSchema: refundSchema,
      invalidatesTags: ['Refunds', 'Invoices'],
    }),
  }),
});

export const { useGetRefundsQuery, useRequestRefundMutation, useDecideRefundMutation } = refundsApi;
