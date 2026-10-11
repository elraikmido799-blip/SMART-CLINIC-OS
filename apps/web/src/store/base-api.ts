import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '@oxygen/shared';
import { env } from '@/lib/env';

// الـEndpoints بتتضاف على الـbaseApi ده بـinjectEndpoints، كل واحد في الـ_api بتاع صفحته
export const baseApi = createApi({
  reducerPath: 'api',
  // الـMocks (وكل داتتها) بتتحمّل أول ما أول طلب يحصل، مش مع كل صفحة (L-62)
  baseQuery: createBaseQuery({
    baseUrl: env.apiUrl,
    mocking: env.apiMocking,
    mockHandlers: () => import('@/mocks/handlers').then((module) => module.mockHandlers),
  }),
  tagTypes: ['Me', 'Appointments', 'Documents', 'Profile'],
  // الرد جه بشكل غير الـresponseSchema (zod) = خطأ عادي في الشاشة بدل ما الصفحة تقع (DEC-30)
  catchSchemaFailure: (error) => ({
    status: 'CUSTOM_ERROR' as const,
    error: 'INVALID_RESPONSE',
    data: error.issues,
  }),
  endpoints: () => ({}),
});
