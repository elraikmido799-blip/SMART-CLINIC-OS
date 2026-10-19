import { useMatches } from '@tanstack/react-router';
import type { NavKey } from './nav-items';

/** القسم بتاع الصفحة المفتوحة (من staticData.nav في الـroute) */
export function useCurrentNav(): NavKey | undefined {
  return useMatches({
    select: (matches) => matches.findLast((match) => match.staticData?.nav)?.staticData.nav,
  });
}
