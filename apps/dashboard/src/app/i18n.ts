import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale } from '@oxygen/shared';
import arAppointments from '@/locales/ar/appointments.json';
import arAuth from '@/locales/ar/auth.json';
import arBilling from '@/locales/ar/billing.json';
import arCalendar from '@/locales/ar/calendar.json';
import arCommon from '@/locales/ar/common.json';
import arFrontDesk from '@/locales/ar/frontDesk.json';
import arDoctorDay from '@/locales/ar/doctorDay.json';
import arNav from '@/locales/ar/nav.json';
import arPatients from '@/locales/ar/patients.json';
import enAppointments from '@/locales/en/appointments.json';
import enAuth from '@/locales/en/auth.json';
import enBilling from '@/locales/en/billing.json';
import enCalendar from '@/locales/en/calendar.json';
import enCommon from '@/locales/en/common.json';
import enFrontDesk from '@/locales/en/frontDesk.json';
import enDoctorDay from '@/locales/en/doctorDay.json';
import enNav from '@/locales/en/nav.json';
import enPatients from '@/locales/en/patients.json';

/**
 * ملف ترجمة لكل جزء (namespace) بدل ملف واحد كبير (20 · 1.7).
 * Namespace جديد = ملف في locales/ar و locales/en + سطر هنا.
 * الأنواع في i18next.d.ts، فأي مفتاح غلط بيطلع Error في tsc.
 */
export const resources = {
  ar: {
    common: arCommon,
    nav: arNav,
    auth: arAuth,
    appointments: arAppointments,
    frontDesk: arFrontDesk,
    doctorDay: arDoctorDay,
    calendar: arCalendar,
    patients: arPatients,
    billing: arBilling,
  },
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    appointments: enAppointments,
    frontDesk: enFrontDesk,
    doctorDay: enDoctorDay,
    calendar: enCalendar,
    patients: enPatients,
    billing: enBilling,
  },
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
  ns: Object.keys(resources.ar),
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
