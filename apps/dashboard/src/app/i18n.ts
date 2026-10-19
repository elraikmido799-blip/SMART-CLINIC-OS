import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale } from '@oxygen/shared';
import arAuth from '@/locales/ar/auth.json';
import arCommon from '@/locales/ar/common.json';
import arNav from '@/locales/ar/nav.json';
import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enNav from '@/locales/en/nav.json';

/**
 * ملف ترجمة لكل جزء (namespace) بدل ملف واحد كبير (20 · 1.7).
 * Namespace جديد = ملف في locales/ar و locales/en + سطر هنا.
 * الأنواع في i18next.d.ts، فأي مفتاح غلط بيطلع Error في tsc.
 */
export const resources = {
  ar: { common: arCommon, nav: arNav, auth: arAuth },
  en: { common: enCommon, nav: enNav, auth: enAuth },
} as const;

const LOCALE_KEY = 'oxygen-staff-locale';

function storedLocale() {
  try {
    const value = localStorage.getItem(LOCALE_KEY);
    return value && isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

void i18n.use(initReactI18next).init({
  resources,
  ns: ['common', 'nav', 'auth'],
  defaultNS: 'common',
  lng: storedLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false }, // React بيعمل escape لوحده
});

// اللغة اللي الموظف اختارها بتفضل على الجهاز ده
i18n.on('languageChanged', (language) => {
  try {
    localStorage.setItem(LOCALE_KEY, language);
  } catch {
    // المتصفح مانع التخزين
  }
});

export default i18n;
