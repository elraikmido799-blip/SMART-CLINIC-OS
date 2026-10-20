import { z } from 'zod';

export const NOTIFICATION_EVENTS = [
  'booking_confirmed',
  'reminder_24h',
  'reminder_2h',
  'payment_receipt',
  'follow_up',
  'program_stage',
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export const NOTIFICATION_CHANNELS = ['whatsapp', 'sms', 'email'] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/** المتغيرات اللي ينفع تتحط في القالب بين قوسين مزدوجين، ومثالها في المعاينة (docs/10) */
export const TEMPLATE_VARIABLES = [
  'patient_name',
  'date',
  'time',
  'doctor',
  'branch',
  'amount',
] as const;

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

/**
 * قالب إشعار (D-34 · docs/04 `notification_templates`): حدث × قناة، بالعربي والإنجليزي. الإيميل ليه عنوان.
 * الواتساب بيتبعت قالب معتمد من واتساب بس، فتعديله بيروح للمراجعة هناك (`approval`).
 */
export const notificationTemplateSchema = z.object({
  id: z.string(),
  event: z.enum(NOTIFICATION_EVENTS),
  channel: z.enum(NOTIFICATION_CHANNELS),
  subject_ar: z.string(),
  subject_en: z.string(),
  body_ar: z.string(),
  body_en: z.string(),
  active: z.boolean(),
  approval: z.enum(['approved', 'pending']).nullable(),
});

export type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;

export type NotificationTemplateBody = Omit<
  NotificationTemplate,
  'id' | 'event' | 'channel' | 'approval'
>;

export type UpdateNotificationTemplateBody = { id: string } & NotificationTemplateBody;
