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

/** 10000 ← "10,000" بنفس الأرقام اللي في formatMoney */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(value);
}
