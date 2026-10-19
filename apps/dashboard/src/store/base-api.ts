import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '@oxygen/shared';
import { env } from '@/lib/env';

// الـEndpoints بتتضاف على الـbaseApi ده بـinjectEndpoints، كل واحد في الـfeature بتاعه
export const baseApi = createApi({
  reducerPath: 'api',
  // الـMocks (وكل داتتها) بتتحمّل مع أول طلب، مش مع الـJS بتاع أول صفحة
  baseQuery: createBaseQuery({
    baseUrl: env.apiUrl,
    mocking: env.apiMocking,
    mockHandlers: () => import('@/mocks/handlers').then((module) => module.mockHandlers),
  }),
  tagTypes: [
    'Me',
    'Branches',
    'Practitioners',
    'Appointments',
    'FrontDeskSummary',
    'Patients',
    'TimeBlocks',
    'CashClosing',
  ],
  // الرد جه بشكل غير الـresponseSchema (zod) = خطأ عادي في الشاشة بدل ما الصفحة تقع (DEC-30)
  catchSchemaFailure: (error) => ({
    status: 'CUSTOM_ERROR' as const,
    error: 'INVALID_RESPONSE',
    data: error.issues,
  }),
  endpoints: () => ({}),
});
