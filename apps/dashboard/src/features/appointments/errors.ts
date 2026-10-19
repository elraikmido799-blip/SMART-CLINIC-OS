import { apiErrorCode } from '@/lib/api-error';

// أكواد الأخطاء اللي ليها رسالة في calendar.json (أي كود تاني = رسالة عامة)
const KNOWN = [
  'SLOT_TAKEN',
  'PAST_TIME',
  'OUTSIDE_HOURS',
  'INVALID_STATUS',
  'INVALID_RANGE',
  'FORBIDDEN',
] as const;

export type CalendarErrorKey = `errors.${(typeof KNOWN)[number] | 'generic'}`;

/** مفتاح رسالة الخطأ في namespace الـcalendar */
export function calendarErrorKey(error: unknown): CalendarErrorKey {
  const code = apiErrorCode(error as never);
  return (KNOWN as readonly string[]).includes(code ?? '')
    ? (`errors.${code}` as CalendarErrorKey)
    : 'errors.generic';
}
