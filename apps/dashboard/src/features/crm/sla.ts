import type { Lead } from './types';

// أول رد على الـLead في خلال المدة دي (docs/07 §4: أول 5–15 دقيقة نسبة تحويله أعلى بكتير)
export const SLA_MINUTES = 15;

const MINUTE = 60_000;

/** الدقايق من وقت الإنشاء لحد أول تواصل (أو لحد دلوقتي لو لسه محدش كلّمه) */
export const minutesToContact = (
  lead: Pick<Lead, 'created_at' | 'first_contacted_at'>,
  now = Date.now(),
) =>
  Math.max(
    0,
    Math.floor(
      ((lead.first_contacted_at ? Date.parse(lead.first_contacted_at) : now) -
        Date.parse(lead.created_at)) /
        MINUTE,
    ),
  );

export type SlaState = 'ok' | 'warning' | 'late';

/** جوه الـSLA (15 دقيقة) · لحد ساعة · أكتر */
export const slaState = (minutes: number): SlaState =>
  minutes <= SLA_MINUTES ? 'ok' : minutes <= 60 ? 'warning' : 'late';

/** الـLead اتكلّم في خلال الـSLA؟ (اللي لسه محدش كلّمه ومعدّاش الـSLA بيتحسب "لسه") */
export const withinSla = (lead: Pick<Lead, 'created_at' | 'first_contacted_at'>) =>
  lead.first_contacted_at !== null && minutesToContact(lead) <= SLA_MINUTES;
