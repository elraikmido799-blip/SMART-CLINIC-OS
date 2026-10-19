import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import {
  agentSchema,
  campaignSchema,
  leadActivitySchema,
  leadSchema,
  whatsappTemplateSchema,
  type Agent,
  type Campaign,
  type ConvertLeadBody,
  type CreateLeadBody,
  type Lead,
  type LeadActivity,
  type LeadQuery,
  type LogCallBody,
  type MarkLostBody,
  type MoveLeadBody,
  type SendWhatsappBody,
  type WhatsappTemplate,
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
    getLeadActivities: build.query<LeadActivity[], string>({
      query: (id) => `/staff/leads/${id}/activities`,
      rawResponseSchema: z.object({ data: z.array(leadActivitySchema) }),
      transformResponse: (response: { data: LeadActivity[] }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'LeadActivities', id }],
    }),
    getWhatsappTemplates: build.query<WhatsappTemplate[], void>({
      query: () => '/staff/whatsapp-templates',
      rawResponseSchema: z.object({ data: z.array(whatsappTemplateSchema) }),
      transformResponse: (response: { data: WhatsappTemplate[] }) => response.data,
    }),
    // مكالمة: أول تواصل بيسجّل الوقت (الـSLA) وبينقل الـLead لـ"اتكلّمنا معاه"
    logLeadCall: build.mutation<Lead, LogCallBody>({
      query: ({ id, ...body }) => ({ url: `/staff/leads/${id}/calls`, method: 'POST', body }),
      responseSchema: leadSchema,
      invalidatesTags: (_r, _e, { id }) => ['Leads', { type: 'LeadActivities', id }],
    }),
    // رسالة واتساب من قالب معتمد (الباك هو اللي بيبعت)
    sendLeadWhatsapp: build.mutation<Lead, SendWhatsappBody>({
      query: ({ id, ...body }) => ({ url: `/staff/leads/${id}/whatsapp`, method: 'POST', body }),
      responseSchema: leadSchema,
      invalidatesTags: (_r, _e, { id }) => ['Leads', { type: 'LeadActivities', id }],
    }),
    markLeadLost: build.mutation<Lead, MarkLostBody>({
      query: ({ id, ...body }) => ({ url: `/staff/leads/${id}/lost`, method: 'POST', body }),
      responseSchema: leadSchema,
      invalidatesTags: (_r, _e, { id }) => ['Leads', { type: 'LeadActivities', id }],
    }),
    // بيعمل مريض من بيانات الـLead (409 DUPLICATE_PHONE لو الموبايل عند مريض) ويربطهم
    convertLead: build.mutation<Lead, ConvertLeadBody>({
      query: ({ id, ...body }) => ({ url: `/staff/leads/${id}/convert`, method: 'POST', body }),
      responseSchema: leadSchema,
      invalidatesTags: (_r, _e, { id }) => ['Leads', 'Patients', { type: 'LeadActivities', id }],
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
  useGetLeadActivitiesQuery,
  useGetWhatsappTemplatesQuery,
  useLogLeadCallMutation,
  useSendLeadWhatsappMutation,
  useMarkLeadLostMutation,
  useConvertLeadMutation,
} = crmApi;
