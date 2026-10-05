import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '@oxygen/shared';
import { env } from '@/lib/env';
import { mockHandlers } from '@/mocks/handlers';

// الـEndpoints بتتضاف على الـbaseApi ده بـinjectEndpoints، كل واحد في الـ_api بتاع صفحته
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: createBaseQuery({ baseUrl: env.apiUrl, mocking: env.apiMocking, mockHandlers }),
  tagTypes: ['Me', 'Appointments', 'Documents', 'Profile'],
  endpoints: () => ({}),
});
