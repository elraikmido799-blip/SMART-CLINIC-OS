import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE } from '@oxygen/shared';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false }, // React بيعمل escape لوحده
});

export default i18n;
