import { z } from 'zod';

export const INTEGRATION_KEYS = [
  'payments',
  'whatsapp',
  'sms',
  'email',
  'push',
  'meta_leads',
  'meta_pixel',
  'tiktok',
  'analytics',
  'maps',
  'video_visits',
] as const;

export type IntegrationKey = (typeof INTEGRATION_KEYS)[number];

export const INTEGRATION_STATUSES = ['connected', 'not_configured', 'error'] as const;

export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

/**
 * ربط خدمة خارجية (D-38 · docs/11 §2): الحالة وتفعيل/إيقاف بس. **مفاتيح الخدمة (Credentials) بتتحط في الباك** ومبتتعرضش
 * هنا ولا بتعدي على الفرونت. `status`: متوصّلة · لسه متضبطتش · في خطأ. وزرار "اختبر الاتصال" بيرجّع الحالة دلوقتي.
 */
export const integrationSchema = z.object({
  key: z.enum(INTEGRATION_KEYS),
  enabled: z.boolean(),
  status: z.enum(INTEGRATION_STATUSES),
  // آخر فحص (ISO) أو فاضي لو عمره ما اتفحص
  checked_at: z.string().nullable(),
  // المرحلة في docs/11: MVP أو P2
  phase: z.enum(['mvp', 'p2']),
});

export type Integration = z.infer<typeof integrationSchema>;

export type SetIntegrationBody = { key: IntegrationKey; enabled: boolean };
