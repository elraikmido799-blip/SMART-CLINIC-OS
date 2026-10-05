import type { Locale } from './locales';

/**
 * الداتا اللي ليها لغتين بترجع من الـAPI كـ`name_ar` و`name_en`.
 * مثال: localized(doctor, 'name', locale)
 */
export const localized = <K extends string>(
  item: Record<`${K}_${Locale}`, string>,
  field: K,
  locale: Locale,
): string => item[`${field}_${locale}`];
