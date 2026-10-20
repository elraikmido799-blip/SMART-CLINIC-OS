import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  catalogItemSchema,
  type CatalogItem,
  type CatalogItemBody,
  type UpdateCatalogItemBody,
} from './types';

/** الكتالوج (7.1). 403 `FORBIDDEN` · 422 `INVALID_ITEM` (الاسم أو السعر ناقص) */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCatalog: build.query<CatalogItem[], void>({
      query: () => '/staff/catalog',
      rawResponseSchema: z.object({ data: z.array(catalogItemSchema) }),
      transformResponse: (response: { data: CatalogItem[] }) => response.data,
      providesTags: ['Catalog'],
    }),
    createCatalogItem: build.mutation<CatalogItem, CatalogItemBody>({
      query: (body) => ({ url: '/staff/catalog', method: 'POST', body }),
      responseSchema: catalogItemSchema,
      invalidatesTags: ['Catalog', 'Sellables'],
    }),
    updateCatalogItem: build.mutation<CatalogItem, UpdateCatalogItemBody>({
      query: ({ id, ...body }) => ({ url: `/staff/catalog/${id}`, method: 'PUT', body }),
      responseSchema: catalogItemSchema,
      invalidatesTags: ['Catalog', 'Sellables'],
    }),
  }),
});

export const { useGetCatalogQuery, useCreateCatalogItemMutation, useUpdateCatalogItemMutation } =
  catalogApi;
