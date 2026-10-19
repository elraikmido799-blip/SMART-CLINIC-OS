import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import { patientPhotoSchema, type PatientPhoto, type UploadPhotoBody } from './types';

/** صور المريض. 422 `INVALID_IMAGE` لو الملف مش صورة */
export const photosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPatientPhotos: build.query<PatientPhoto[], string>({
      query: (patientId) => `/staff/patients/${patientId}/photos`,
      rawResponseSchema: z.object({ data: z.array(patientPhotoSchema) }),
      transformResponse: (response: { data: PatientPhoto[] }) => response.data,
      providesTags: (_result, _error, patientId) => [{ type: 'Photos', id: patientId }],
    }),
    uploadPatientPhoto: build.mutation<PatientPhoto, UploadPhotoBody>({
      query: ({ patient_id, ...body }) => ({
        url: `/staff/patients/${patient_id}/photos`,
        method: 'POST',
        body,
      }),
      responseSchema: patientPhotoSchema,
      invalidatesTags: (_result, _error, { patient_id }) => [{ type: 'Photos', id: patient_id }],
    }),
  }),
});

export const { useGetPatientPhotosQuery, useUploadPatientPhotoMutation } = photosApi;
