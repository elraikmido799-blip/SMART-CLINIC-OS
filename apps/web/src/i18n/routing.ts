import { defineRouting } from 'next-intl/routing';
import { LOCALES } from '@oxygen/shared';

// الموقع إنجليزي أساسي وبيدعم العربي (DEC-26). الداشبورد بياخد DEFAULT_LOCALE من shared (عربي).
// اللي متصفحه عربي بيروح /ar لوحده (localeDetection شغال افتراضيًا).
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
});
