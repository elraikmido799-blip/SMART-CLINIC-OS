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
