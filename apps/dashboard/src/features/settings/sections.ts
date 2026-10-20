import type { Permission } from '@/features/auth/permissions';
import { hasAny, useMe } from '@/features/auth/use-me';

export type SettingsSection = 'templates' | 'staff' | 'branches' | 'schedules';

type Entry = {
  key: SettingsSection;
  to: '/settings/templates' | '/settings/staff' | '/settings/branches' | '/settings/schedules';
  permissions: Permission[];
};

/**
 * أقسام الإعدادات (D-34 → D-39) بالترتيب، وكل قسم حسب صلاحية: مين شايف إيه (06). القسم بيتضاف هنا مع خطوته.
 */
const SECTIONS: Entry[] = [
  {
    key: 'templates',
    to: '/settings/templates',
    permissions: ['settings.read', 'settings.manage'],
  },
  { key: 'staff', to: '/settings/staff', permissions: ['staff.manage', 'roles.manage'] },
  { key: 'branches', to: '/settings/branches', permissions: ['settings.read', 'settings.manage'] },
  { key: 'schedules', to: '/settings/schedules', permissions: ['staff.manage'] },
];

export const useSettingsSections = () => {
  const me = useMe();
  return SECTIONS.filter((item) => hasAny(me, item.permissions));
};
