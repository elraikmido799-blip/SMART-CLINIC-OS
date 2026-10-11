import { baseApi } from '@/store/base-api';
import type { AccountDeletionRequestBody } from '@/types/account';

export const accountDeletionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestAccountDeletion: build.mutation<{ id: string }, AccountDeletionRequestBody>({
      query: (body) => ({ url: '/public/account-deletion-requests', method: 'POST', body }),
    }),
  }),
});

export const { useRequestAccountDeletionMutation } = accountDeletionApi;
