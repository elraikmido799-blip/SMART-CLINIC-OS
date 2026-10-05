import { baseApi } from '@/store/base-api';
import type { CreateLeadBody } from '@/types/lead';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createLead: build.mutation<{ id: string }, CreateLeadBody>({
      query: (body) => ({ url: '/public/leads', method: 'POST', body }),
    }),
  }),
});

export const { useCreateLeadMutation } = leadsApi;
