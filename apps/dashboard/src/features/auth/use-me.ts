import { useGetMeQuery } from './auth.api';
import type { Permission } from './permissions';
import type { StaffMe } from './types';

/**
 * الموظف اللي داخل. بيتنادى جوه الصفحات اللي ورا الـGuard بس (routes/_app)،
 * فالداتا موجودة دايمًا هناك (الـGuard بيستناها قبل ما الصفحة تفتح).
 */
export function useMe(): StaffMe {
  const { data } = useGetMeQuery();
  if (!data) throw new Error('useMe() is only available behind the _app guard');
  return data;
}

export const hasAny = (me: StaffMe, anyOf: readonly Permission[]) =>
  anyOf.length === 0 || anyOf.some((permission) => me.permissions.includes(permission));

/** `useCan('patients.read', 'billing.read')` = عنده واحدة منهم على الأقل */
export function useCan(...anyOf: Permission[]): boolean {
  return hasAny(useMe(), anyOf);
}
