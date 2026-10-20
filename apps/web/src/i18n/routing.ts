import { defineRouting } from 'next-intl/routing';
import { LOCALES } from '@oxygen/shared';

// الموقع إنجليزي أساسي وبيدعم العربي (DEC-26). الداشبورد بياخد DEFAULT_LOCALE من shared (عربي).
// من غير كشف لغة المتصفح: أي حد يفتح الموقع يشوف الإنجليزي، والعربي بزرار اللغة (P-39).
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localeDetection: false,
});
