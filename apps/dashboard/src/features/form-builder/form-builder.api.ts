import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import type { FormTemplate } from '@/features/encounters/types';
import {
  formTemplateDetailSchema,
  formTemplateSummarySchema,
  type FormTemplateDetail,
  type FormTemplateSummary,
} from './types';

/**
 * بنّاء الفورمات (4.9). 403 `FORBIDDEN` لو مفيش صلاحية · 422 `INVALID_TEMPLATE` لو الفورم ناقص.
 * النشر بيعمل نسخة جديدة (version + 1)، والكشوفات القديمة بتفضل على نسختها.
 */
export const formBuilderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFormTemplates: build.query<FormTemplateSummary[], void>({
      query: () => '/staff/form-templates',
      rawResponseSchema: z.object({ data: z.array(formTemplateSummarySchema) }),
      transformResponse: (response: { data: FormTemplateSummary[] }) => response.data,
      providesTags: ['FormTemplates'],
    }),
    getFormTemplate: build.query<FormTemplateDetail, string>({
      query: (code) => `/staff/form-templates/${code}`,
      responseSchema: formTemplateDetailSchema,
      providesTags: (_result, _error, code) => [{ type: 'FormTemplates', id: code }],
    }),
    // الأخصائي بيقترح (يحفظ مسودة)، والنشر للـAdmin بس
    saveFormDraft: build.mutation<FormTemplateDetail, { code: string; template: FormTemplate }>({
      query: ({ code, template }) => ({
        url: `/staff/form-templates/${code}/draft`,
        method: 'PUT',
        body: template,
      }),
      responseSchema: formTemplateDetailSchema,
      invalidatesTags: (_result, _error, { code }) => [
        'FormTemplates',
        { type: 'FormTemplates', id: code },
      ],
    }),
    publishFormTemplate: build.mutation<FormTemplateDetail, string>({
      query: (code) => ({ url: `/staff/form-templates/${code}/publish`, method: 'POST' }),
      responseSchema: formTemplateDetailSchema,
      invalidatesTags: (_result, _error, code) => [
        'FormTemplates',
        { type: 'FormTemplates', id: code },
      ],
    }),
  }),
});

export const {
  useGetFormTemplatesQuery,
  useGetFormTemplateQuery,
  useSaveFormDraftMutation,
  usePublishFormTemplateMutation,
} = formBuilderApi;
