import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@oxygen/shared';

/** اللغة الحالية كـ`Locale` (للـformat functions و`localized`) */
export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
}
