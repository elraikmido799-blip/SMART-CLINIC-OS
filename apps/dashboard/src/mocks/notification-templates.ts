import { MockHttpError, type MockHandlers } from '@oxygen/shared';
import {
  NOTIFICATION_EVENTS,
  TEMPLATE_VARIABLES,
  type NotificationChannel,
  type NotificationEvent,
  type NotificationTemplate,
  type NotificationTemplateBody,
} from '@/features/settings/notification-types';
import { currentStaff, toMe } from './auth';
import { readDb, writeDb, type MockDb } from './db';

/**
 * قوالب الإشعارات الوهمية (9.2): كل حدث بقنواته (الواتساب والـSMS لكل الأحداث، والإيميل للإيصال والمتابعة).
 * نصوص عامة بمتغيرات `{{patient_name}}`، والواتساب معتمد من Meta (حالة وهمية).
 */
const TEXT: Record<NotificationEvent, { ar: string; en: string }> = {
  booking_confirmed: {
    ar: 'أهلًا {{patient_name}}، حجزك مع {{doctor}} يوم {{date}} الساعة {{time}} في فرع {{branch}} اتأكد.',
    en: 'Hi {{patient_name}}, your appointment with {{doctor}} on {{date}} at {{time}} at {{branch}} is confirmed.',
  },
  reminder_24h: {
    ar: 'تذكير: ميعادك بكرة {{date}} الساعة {{time}} مع {{doctor}} في {{branch}}.',
    en: 'Reminder: your appointment is tomorrow, {{date}} at {{time}}, with {{doctor}} at {{branch}}.',
  },
  reminder_2h: {
    ar: 'ميعادك مع {{doctor}} بعد ساعتين الساعة {{time}}. منتظرينك في {{branch}}.',
    en: 'Your appointment with {{doctor}} is in two hours, at {{time}}. See you at {{branch}}.',
  },
  payment_receipt: {
    ar: 'شكرًا {{patient_name}}، استلمنا {{amount}}. إيصالك جاهز في ملفك.',
    en: 'Thank you {{patient_name}}, we received {{amount}}. Your receipt is in your file.',
  },
  follow_up: {
    ar: 'إزيك {{patient_name}}؟ حبينا نطمّن عليك بعد زيارتك مع {{doctor}}.',
    en: 'How are you, {{patient_name}}? We wanted to check in after your visit with {{doctor}}.',
  },
  program_stage: {
    ar: 'مبروك {{patient_name}}، خلّصت مرحلة جديدة في برنامجك.',
    en: 'Congratulations {{patient_name}}, you finished a new stage of your program.',
  },
};

const EMAIL_EVENTS: NotificationEvent[] = ['payment_receipt', 'follow_up'];

export function ensureNotificationTemplates(db: MockDb) {
  if (db.notification_templates.length > 0) return;
  db.notification_templates = NOTIFICATION_EVENTS.flatMap((event) =>
    (
      [
        'whatsapp',
        'sms',
        ...(EMAIL_EVENTS.includes(event) ? ['email'] : []),
      ] as NotificationChannel[]
    ).map((channel): NotificationTemplate => ({
      id: `tpl-${event}-${channel}`,
      event,
      channel,
      subject_ar: channel === 'email' ? 'رسالة من Oxygen' : '',
      subject_en: channel === 'email' ? 'A message from Oxygen' : '',
      body_ar: TEXT[event].ar,
      body_en: TEXT[event].en,
      active: !(event === 'program_stage' && channel === 'sms'),
      approval: channel === 'whatsapp' ? 'approved' : null,
    })),
  );
}

const needs = () => {
  if (!toMe(currentStaff()).permissions.includes('settings.manage'))
    throw new MockHttpError(403, 'FORBIDDEN');
};

// المتغيرات المسموحة بس
const unknownVariable = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].some(
    (match) => !(TEMPLATE_VARIABLES as readonly string[]).includes(match[1]),
  );

export const notificationTemplateHandlers: MockHandlers = {
  getNotificationTemplates: () => {
    if (
      !toMe(currentStaff()).permissions.some(
        (p) => p === 'settings.read' || p === 'settings.manage',
      )
    )
      throw new MockHttpError(403, 'FORBIDDEN');
    writeDb(ensureNotificationTemplates);
    return { data: readDb().notification_templates };
  },

  updateNotificationTemplate: ({ url, body }) => {
    needs();
    const id = url.split('/').at(-1) ?? '';
    const input = body as NotificationTemplateBody;
    if (
      !input.body_ar.trim() ||
      !input.body_en.trim() ||
      unknownVariable(input.body_ar + input.body_en + input.subject_ar + input.subject_en)
    )
      throw new MockHttpError(422, 'INVALID_TEMPLATE');
    writeDb(ensureNotificationTemplates);
    writeDb((db) => {
      const found = db.notification_templates.find((item) => item.id === id);
      if (!found) throw new MockHttpError(404, 'NOT_FOUND');
      // تعديل نص الواتساب بيرجّعه للمراجعة عند واتساب
      const textChanged = found.body_ar !== input.body_ar || found.body_en !== input.body_en;
      Object.assign(found, input);
      if (found.channel === 'whatsapp' && textChanged) found.approval = 'pending';
    });
    return readDb().notification_templates.find((item) => item.id === id)!;
  },
};
