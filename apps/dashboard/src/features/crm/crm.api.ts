import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  agentSchema,
  campaignSchema,
  leadSchema,
  type Agent,
  type Campaign,
  type CreateLeadBody,
  type Lead,
  type LeadQuery,
  type MoveLeadBody,
} from './types';

/**
 * الـCRM (6.1). 409 `DUPLICATE_PHONE` (الموبايل عند Lead أو مريض تاني) · 422 `STAGE_AUTOMATIC`
 * (المرحلة دي بتتحدث تلقائي ومبتتنقلش بإيد) · 403 `FORBIDDEN`.
 */
export const crmApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLeads: build.query<Lead[], LeadQuery>({
      query: (params) => ({ url: '/staff/leads', params }),
      rawResponseSchema: z.object({ data: z.array(leadSchema) }),
      transformResponse: (response: { data: Lead[] }) => response.data,
      providesTags: ['Leads'],
    }),
    getCampaigns: build.query<Campaign[], void>({
      query: () => '/staff/campaigns',
      rawResponseSchema: z.object({ data: z.array(campaignSchema) }),
      transformResponse: (response: { data: Campaign[] }) => response.data,
      providesTags: ['Campaigns'],
    }),
    // موظفين الـCRM (فلتر "المسؤول")
    getCrmAgents: build.query<Agent[], void>({
      query: () => '/staff/crm-agents',
      rawResponseSchema: z.object({ data: z.array(agentSchema) }),
      transformResponse: (response: { data: Agent[] }) => response.data,
    }),
    createLead: build.mutation<Lead, CreateLeadBody>({
      query: (body) => ({ url: '/staff/leads', method: 'POST', body }),
      responseSchema: leadSchema,
      invalidatesTags: ['Leads'],
    }),
    moveLeadStage: build.mutation<Lead, MoveLeadBody>({
      query: ({ id, stage }) => ({
        url: `/staff/leads/${id}/stage`,
        method: 'POST',
        body: { stage },
      }),
      responseSchema: leadSchema,
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetCampaignsQuery,
  useGetCrmAgentsQuery,
  useCreateLeadMutation,
  useMoveLeadStageMutation,
} = crmApi;
