import { baseApi } from '@/store/base-api';
import { executiveSchema, type Executive, type ExecutiveQuery } from './types';

/** الداشبوردات (8.x). 403 `FORBIDDEN` */
export const dashboardsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExecutive: build.query<Executive, ExecutiveQuery>({
      query: (params) => ({ url: '/staff/dashboards/executive', params }),
      responseSchema: executiveSchema,
    }),
  }),
});

export const { useGetExecutiveQuery } = dashboardsApi;
