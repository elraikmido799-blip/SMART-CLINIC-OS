import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  contentItemSchema,
  siteImageSchema,
  type ContentBody,
  type ContentItem,
  type SetSiteImageBody,
  type SiteImage,
  type UpdateContentBody,
} from './types';

/** المحتوى (9.1). 403 `FORBIDDEN` · 422 `INVALID_CONTENT` (العنوان بالغتين ناقص) · `IMAGE_TOO_LARGE` */
export const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContent: build.query<ContentItem[], void>({
      query: () => '/staff/content',
      rawResponseSchema: z.object({ data: z.array(contentItemSchema) }),
      transformResponse: (response: { data: ContentItem[] }) => response.data,
      providesTags: ['Content'],
    }),
    createContent: build.mutation<ContentItem, ContentBody>({
      query: (body) => ({ url: '/staff/content', method: 'POST', body }),
      responseSchema: contentItemSchema,
      invalidatesTags: ['Content'],
    }),
    updateContent: build.mutation<ContentItem, UpdateContentBody>({
      query: ({ id, ...body }) => ({ url: `/staff/content/${id}`, method: 'PUT', body }),
      responseSchema: contentItemSchema,
      invalidatesTags: ['Content'],
    }),
    getSiteImages: build.query<SiteImage[], void>({
      query: () => '/staff/site-images',
      rawResponseSchema: z.object({ data: z.array(siteImageSchema) }),
      transformResponse: (response: { data: SiteImage[] }) => response.data,
      providesTags: ['SiteImages'],
    }),
    setSiteImage: build.mutation<SiteImage, SetSiteImageBody>({
      query: (body) => ({ url: '/staff/site-images', method: 'PUT', body }),
      responseSchema: siteImageSchema,
      invalidatesTags: ['SiteImages'],
    }),
  }),
});

export const {
  useGetContentQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useGetSiteImagesQuery,
  useSetSiteImageMutation,
} = contentApi;
