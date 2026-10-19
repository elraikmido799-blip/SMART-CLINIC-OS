import { useEffect } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import arLocale from 'dayjs/locale/ar';
import { useTranslation } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';
import { DEFAULT_LOCALE, directionOf, isLocale } from '@oxygen/shared';
import { store } from '@/store/store';
import { theme } from './theme';

const ANTD_LOCALES = { ar: arEG, en: enUS };

// الأرقام إنجليزي حتى في العربي (DEC-12): العربي بتاع dayjs بيحوّلها لـ١٢٣ في الـDatePicker، فبنشيل التحويل
// (preparse وpostformat مش في أنواع ILocale، بس dayjs بيستخدمهم)
const keepDigits = (text: string) => text;
dayjs.locale(
  { ...arLocale, preparse: keepDigits, postformat: keepDigits } as typeof arLocale,
  undefined,
  true,
);

export function Providers({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const locale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
  const dir = directionOf(locale);

  // اللغة بتغيّر اتجاه الصفحة كلها، وأسماء الأيام والشهور في التواريخ
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    dayjs.locale(locale);
  }, [locale, dir]);

  return (
    <ReduxProvider store={store}>
      <ConfigProvider direction={dir} locale={ANTD_LOCALES[locale]} theme={theme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ReduxProvider>
  );
}
