import { z } from 'zod';
import { baseApi } from '@/store/base-api';
import { auditEntrySchema, type AuditEntry, type AuditQuery } from './audit-types';

/** سجل العمليات (9.7). 403 `FORBIDDEN` — للقراءة بس */
export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLog: build.query<AuditEntry[], AuditQuery>({
      query: (params) => ({ url: '/staff/audit', params }),
      rawResponseSchema: z.object({ data: z.array(auditEntrySchema) }),
      transformResponse: (response: { data: AuditEntry[] }) => response.data,
    }),
  }),
});

export const { useGetAuditLogQuery } = auditApi;
