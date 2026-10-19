import 'i18next';
import type { resources } from './i18n';

// مفاتيح الترجمة بتتفحص في tsc: t('nav.homee') = Error
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['ar'];
  }
}
