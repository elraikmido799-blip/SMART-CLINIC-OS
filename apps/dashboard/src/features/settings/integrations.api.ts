import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  integrationSchema,
  type Integration,
  type IntegrationKey,
  type SetIntegrationBody,
} from './integration-types';

/**
 * الـIntegrations (9.6). 403 `FORBIDDEN` · 409 `NOT_CONFIGURED` (مينفعش تتفعّل قبل ما الباك يضبط المفاتيح)
 */
export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIntegrations: build.query<Integration[], void>({
      query: () => '/staff/integrations',
      rawResponseSchema: z.object({ data: z.array(integrationSchema) }),
      transformResponse: (response: { data: Integration[] }) => response.data,
      providesTags: ['Integrations'],
    }),
    setIntegration: build.mutation<Integration, SetIntegrationBody>({
      query: ({ key, ...body }) => ({ url: `/staff/integrations/${key}`, method: 'PUT', body }),
      responseSchema: integrationSchema,
      invalidatesTags: ['Integrations'],
    }),
    // بيفحص الاتصال دلوقتي ويحدّث الحالة
    testIntegration: build.mutation<Integration, IntegrationKey>({
      query: (key) => ({ url: `/staff/integrations/${key}/test`, method: 'POST' }),
      responseSchema: integrationSchema,
      invalidatesTags: ['Integrations'],
    }),
  }),
});

export const { useGetIntegrationsQuery, useSetIntegrationMutation, useTestIntegrationMutation } =
  integrationsApi;
