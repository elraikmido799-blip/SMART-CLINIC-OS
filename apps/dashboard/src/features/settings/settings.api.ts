import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  notificationTemplateSchema,
  type NotificationTemplate,
  type UpdateNotificationTemplateBody,
} from './notification-types';

/** الإعدادات (9.x). 403 `FORBIDDEN` · 422 `INVALID_TEMPLATE` (نص فاضي أو متغير مش معروف) */
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotificationTemplates: build.query<NotificationTemplate[], void>({
      query: () => '/staff/notification-templates',
      rawResponseSchema: z.object({ data: z.array(notificationTemplateSchema) }),
      transformResponse: (response: { data: NotificationTemplate[] }) => response.data,
      providesTags: ['NotificationTemplates'],
    }),
    updateNotificationTemplate: build.mutation<
      NotificationTemplate,
      UpdateNotificationTemplateBody
    >({
      query: ({ id, ...body }) => ({
        url: `/staff/notification-templates/${id}`,
        method: 'PUT',
        body,
      }),
      responseSchema: notificationTemplateSchema,
      invalidatesTags: ['NotificationTemplates'],
    }),
  }),
});

export const { useGetNotificationTemplatesQuery, useUpdateNotificationTemplateMutation } =
  settingsApi;
