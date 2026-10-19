import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  encounterSchema,
  encounterSummarySchema,
  type Encounter,
  type EncounterSummary,
  type SaveDraftBody,
  type SignBody,
} from './types';

/**
 * الكشف (D-11 · docs/20 · 4.3). 404 = الكشف مش موجود · 409 `ALREADY_SIGNED` = اتوقّع واتقفل ·
 * 422 `REQUIRED_FIELDS` عند التوقيع.
 */
export const encountersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // بيبدأ الكشف على ميعاد وصل (والميعاد بيبقى "مع الدكتور")، ولو الكشف موجود بيرجّعه (نفس الرد)
    startEncounter: build.mutation<Encounter, { appointment_id: string }>({
      query: (body) => ({ url: '/staff/encounters', method: 'POST', body }),
      responseSchema: encounterSchema,
      invalidatesTags: ['Appointments', 'Encounters'],
    }),
    getEncounter: build.query<Encounter, string>({
      query: (id) => `/staff/encounters/${id}`,
      responseSchema: encounterSchema,
      providesTags: (_result, _error, id) => [{ type: 'Encounters', id }],
    }),
    // حفظ المسودة تلقائي. مش بيلغي الـCache عشان الفورم ميتحدّثش وهو بيتكتب
    saveEncounterDraft: build.mutation<{ updated_at: string }, SaveDraftBody>({
      query: ({ id, ...body }) => ({ url: `/staff/encounters/${id}/draft`, method: 'PUT', body }),
      responseSchema: z.object({ updated_at: z.string() }),
    }),
    // وقّع واقفل: الميعاد بيبقى "خلص"، وأي تعديل بعده Amendment (مش متعمل لسه)
    signEncounter: build.mutation<Encounter, SignBody>({
      query: ({ id, ...body }) => ({ url: `/staff/encounters/${id}/sign`, method: 'POST', body }),
      responseSchema: encounterSchema,
      invalidatesTags: (_result, _error, { id }) => [
        'Appointments',
        'Patients',
        { type: 'Encounters', id },
      ],
    }),
    getPatientEncounters: build.query<EncounterSummary[], string>({
      query: (patientId) => `/staff/patients/${patientId}/encounters`,
      rawResponseSchema: z.object({ data: z.array(encounterSummarySchema) }),
      transformResponse: (response: { data: EncounterSummary[] }) => response.data,
      providesTags: ['Encounters'],
    }),
  }),
});

export const {
  useStartEncounterMutation,
  useGetEncounterQuery,
  useSaveEncounterDraftMutation,
  useSignEncounterMutation,
  useGetPatientEncountersQuery,
} = encountersApi;
