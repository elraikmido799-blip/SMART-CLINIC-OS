import { baseApi } from '@/store/base-api';
import {
  documentSchema,
  myDocumentsSchema,
  type PatientDocument,
  type UploadDocumentBody,
} from '@/types/portal';

/**
 * ملفات المريض (PP-04). الرفع "شكل" دلوقتي: بيتبعت الاسم والحجم بس.
 * محتاج من مبرمج الباك: رفع الملف نفسه (لينك رفع مباشر) — قبل ما الرفع يبقى حقيقي.
 */
export const documentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyDocuments: build.query<PatientDocument[], void>({
      query: () => '/me/documents',
      rawResponseSchema: myDocumentsSchema,
      transformResponse: (response: { data: PatientDocument[] }) => response.data,
      providesTags: ['Documents'],
    }),
    uploadDocument: build.mutation<PatientDocument, UploadDocumentBody>({
      query: (body) => ({ url: '/me/documents', method: 'POST', body }),
      responseSchema: documentSchema,
      invalidatesTags: ['Documents'],
    }),
    // اللي المريض رفعه بس (ملفات العيادة 403)
    deleteDocument: build.mutation<null, string>({
      query: (id) => ({ url: `/me/documents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const { useGetMyDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } =
  documentsApi;
