export const LOCALES = ['ar', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export const directionOf = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');
