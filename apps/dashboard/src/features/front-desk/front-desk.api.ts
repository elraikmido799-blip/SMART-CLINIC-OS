import { z } from 'zod';
import type { DayQuery } from '@/features/appointments/types';
import { baseApi } from '@/store/base-api';

// شريط أرقام اليوم (D-02): المواعيد · وصلوا · مجوش · اتحصّل
export const frontDeskSummarySchema = z.object({
  appointments: z.number(),
  checked_in: z.number(),
  no_shows: z.number(),
  // بالقروش
  collected: z.number(),
});

export type FrontDeskSummary = z.infer<typeof frontDeskSummarySchema>;

export const frontDeskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFrontDeskSummary: build.query<FrontDeskSummary, DayQuery>({
      query: (params) => ({ url: '/staff/front-desk/summary', params }),
      responseSchema: frontDeskSummarySchema,
      providesTags: ['FrontDeskSummary'],
    }),
  }),
});

export const { useGetFrontDeskSummaryQuery } = frontDeskApi;
