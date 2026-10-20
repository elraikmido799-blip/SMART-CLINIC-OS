import { baseApi } from '@/store/base-api';
import {
  branchDashboardSchema,
  executiveSchema,
  type BranchDashboard,
  type Executive,
  type ExecutiveQuery,
} from './types';

/** الداشبوردات (8.x). 403 `FORBIDDEN` */
export const dashboardsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExecutive: build.query<Executive, ExecutiveQuery>({
      query: (params) => ({ url: '/staff/dashboards/executive', params }),
      responseSchema: executiveSchema,
    }),
    getBranchDashboard: build.query<BranchDashboard, ExecutiveQuery>({
      query: (params) => ({ url: '/staff/dashboards/branch', params }),
      responseSchema: branchDashboardSchema,
    }),
  }),
});

export const { useGetExecutiveQuery, useGetBranchDashboardQuery } = dashboardsApi;
