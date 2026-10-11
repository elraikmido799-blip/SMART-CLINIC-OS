import type { Locale } from './locales';

// الأرقام إنجليزي (1، 2، 3) حتى في العربي. لو Oxygen عايزة أرقام هندي (١، ٢، ٣) شيل "-u-nu-latn"
const NUMBER_LOCALE: Record<Locale, string> = { ar: 'ar-EG-u-nu-latn', en: 'en-EG' };

/** الفلوس جاية من الـAPI بأصغر وحدة (قروش)، يعني 125000 = 1,250 جنيه. */
export function formatMoney(amountMinor: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

/** "08:00" (توقيت الفرع) ← "8:00 AM" أو "8:00 ص" */
export function formatTime(hhmm: string, locale: Locale): string {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(Date.UTC(2000, 0, 1, hours, minutes));
}

// الأيام والمواعيد بتوقيت مصر، مهما كان توقيت جهاز الزائر
const CLINIC_TIME_ZONE = 'Africa/Cairo';

/** رقم اليوم (0 = الحد … 6 = السبت) ← "الأحد" أو "Sunday" */
export function formatWeekday(
  day: number,
  locale: Locale,
  width: 'long' | 'short' = 'long',
): string {
  // 7 يناير 2024 كان حد
  return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], { weekday: width, timeZone: 'UTC' }).format(
    Date.UTC(2024, 0, 7 + day),
  );
}

/** "2026-10-12T17:30:00+03:00" ← { day: "Mon 12 Oct", time: "5:30 PM" } */
export function formatSlot(iso: string, locale: Locale): { day: string; time: string } {
  const date = new Date(iso);
  const options = { timeZone: CLINIC_TIME_ZONE } as const;
  return {
    day: new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
      ...options,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date),
    time: new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
      ...options,
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  };
}

/** "2026-10-01" ← "1 Oct 2026" أو "1 أكتوبر 2026" */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(NUMBER_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** 10000 ← "10,000" بنفس الأرقام اللي في formatMoney */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(value);
}
