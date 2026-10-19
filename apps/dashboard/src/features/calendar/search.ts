import { isSpecialty, type Specialty } from '@oxygen/config';

/**
 * حالة الكالندر في الـURL (زي حجز الموقع — DEC-38): اللينك بيتبعت، والـRefresh والرجوع بيشتغلوا.
 * /calendar?date=2026-10-19&view=week&group=practitioner&specialty=physio&practitioner=st-phy
 */
export type CalendarSearch = {
  date?: string;
  view?: 'day' | 'week';
  group?: 'practitioner' | 'room';
  specialty?: Specialty;
  practitioner?: string;
};

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export function validateCalendarSearch(search: Record<string, unknown>): CalendarSearch {
  return {
    date: isDate(search.date) ? search.date : undefined,
    view: search.view === 'week' ? 'week' : undefined,
    group: search.group === 'room' ? 'room' : undefined,
    specialty: isSpecialty(search.specialty) ? search.specialty : undefined,
    practitioner: typeof search.practitioner === 'string' ? search.practitioner : undefined,
  };
}
