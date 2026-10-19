import { apiErrorCode } from '@/lib/api-error';

// أكواد الأخطاء اللي ليها رسالة في encounters.json (أي كود تاني = رسالة عامة)
const KNOWN = ['ALREADY_SIGNED', 'REQUIRED_FIELDS', 'FORBIDDEN', 'INVALID_STATUS'] as const;

export type EncounterErrorKey = `errors.${(typeof KNOWN)[number] | 'generic'}`;

/** مفتاح رسالة الخطأ في namespace الـencounters */
export function encounterErrorKey(error: unknown): EncounterErrorKey {
  const code = apiErrorCode(error as never);
  return (KNOWN as readonly string[]).includes(code ?? '')
    ? (`errors.${code}` as EncounterErrorKey)
    : 'errors.generic';
}
