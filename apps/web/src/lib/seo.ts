import type { Specialty } from '@oxygen/config';
import { LOCALES, type Locale } from '@oxygen/shared';
import { env } from './env';

// الـSEO (16 · 7.1): لينكات كاملة + نسخة كل صفحة باللغة التانية (hreflang)

/** "/doctors" + "ar" ← "https://…/ar/doctors" */
export const absoluteUrl = (locale: Locale, path = '') =>
  `${env.siteUrl.replace(/\/$/, '')}/${locale}${path === '/' ? '' : path}`;

/** { en: "…/en/doctors", ar: "…/ar/doctors", "x-default": "…/en/doctors" } */
export function languageAlternates(path = '') {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[locale] = absoluteUrl(locale, path);
  languages['x-default'] = absoluteUrl('en', path);
  return languages;
}

// مواعيد الفرع لجوجل: "Sa-Th 08:00-22:00" (السبت للخميس، والجمعة إجازة زي الـMocks — الأيام الحقيقية من Oxygen)
export const openingHours = (opens: string, closes: string) => `Sa-Th ${opens}-${closes}`;

// تخصصاتنا بأسامي schema.org (MedicalSpecialty)
export const SCHEMA_SPECIALTY: Record<Specialty, string> = {
  nutrition: 'DietNutrition',
  physio: 'Physiotherapy',
  derm: 'Dermatology',
  internal: 'PrimaryCare',
};
