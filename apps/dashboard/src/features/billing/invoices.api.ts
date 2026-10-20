import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import { invoiceSchema, type Invoice, type InvoiceQuery } from './types';

/** الفواتير (7.3). 403 `FORBIDDEN` */
export const invoicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<Invoice[], InvoiceQuery>({
      query: (params) => ({ url: '/staff/invoices', params }),
      rawResponseSchema: z.object({ data: z.array(invoiceSchema) }),
      transformResponse: (response: { data: Invoice[] }) => response.data,
      providesTags: ['Invoices'],
    }),
  }),
});

export const { useGetInvoicesQuery } = invoicesApi;
