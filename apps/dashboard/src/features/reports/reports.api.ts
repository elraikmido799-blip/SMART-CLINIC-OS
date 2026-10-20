import { baseApi } from '@/store/base-api';
import { reportSchema, type Report, type ReportQuery } from './types';

/** التقارير (8.4). 403 `FORBIDDEN` · 422 `INVALID_RANGE` (من بعد إلى) */
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReport: build.query<Report, ReportQuery>({
      query: (params) => ({ url: `/staff/reports/${params.code}`, params }),
      responseSchema: reportSchema,
    }),
  }),
});

export const { useGetReportQuery } = reportsApi;
