import { baseApi } from '@/store/base-api';
import {
  branchDashboardSchema,
  executiveSchema,
  journeySchema,
  type BranchDashboard,
  type Executive,
  type ExecutiveQuery,
  type Journey,
  type JourneyQuery,
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
    getJourney: build.query<Journey, JourneyQuery>({
      query: (params) => ({ url: '/staff/dashboards/journey', params }),
      responseSchema: journeySchema,
    }),
  }),
});

export const { useGetExecutiveQuery, useGetBranchDashboardQuery, useGetJourneyQuery } =
  dashboardsApi;
