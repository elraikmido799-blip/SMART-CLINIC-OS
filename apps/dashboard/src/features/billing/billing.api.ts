import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  invoiceSchema,
  sellableSchema,
  type CreateInvoiceBody,
  type Invoice,
  type Sellable,
} from './types';

/** الكاشير (3.6): اللي بيتباع · كود الخصم · الفاتورة. الفواتير كلها في 7.3 */
export const billingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSellables: build.query<Sellable[], void>({
      query: () => '/staff/sellables',
      rawResponseSchema: z.object({ data: z.array(sellableSchema) }),
      transformResponse: (response: { data: Sellable[] }) => response.data,
      providesTags: ['Sellables'],
    }),
    // 422 INVALID_CODE = الكود مش موجود أو خلص
    checkDiscountCode: build.mutation<{ code: string; percent: number }, { code: string }>({
      query: (body) => ({ url: '/staff/discount-codes/check', method: 'POST', body }),
      responseSchema: z.object({ code: z.string(), percent: z.number() }),
    }),
    // 422 DISCOUNT_TOO_HIGH = الخصم أكتر من حد الموظف · INVALID_AMOUNT
    createInvoice: build.mutation<Invoice, CreateInvoiceBody>({
      query: (body) => ({ url: '/staff/invoices', method: 'POST', body }),
      responseSchema: invoiceSchema,
      invalidatesTags: ['Appointments', 'FrontDeskSummary', 'Patients', 'CashClosing'],
    }),
  }),
});

export const { useGetSellablesQuery, useCheckDiscountCodeMutation, useCreateInvoiceMutation } =
  billingApi;
