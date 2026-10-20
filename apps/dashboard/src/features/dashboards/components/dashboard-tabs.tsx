import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/features/auth/permissions';
import { hasAny, useMe } from '@/features/auth/use-me';

type Section = 'executive' | 'branch';

const SECTIONS: { key: Section; to: string; permissions: Permission[] }[] = [
  { key: 'executive', to: '/dashboards', permissions: ['dashboards.all'] },
  { key: 'branch', to: '/dashboards/branch', permissions: ['dashboards.branch', 'dashboards.all'] },
];

/** التنقل جوه الداشبوردات: الـCEO (D-28) · الفرع (D-29). كل تاب حسب الصلاحية */
export function DashboardTabs({ active }: { active: Section }) {
  const { t } = useTranslation('dashboards');
  const navigate = useNavigate();
  const me = useMe();
  const visible = SECTIONS.filter((item) => hasAny(me, item.permissions));

  if (visible.length < 2) return null;

  return (
    <Segmented
      aria-label={t('tabs.label')}
      value={active}
      style={{ marginBottom: 16 }}
      onChange={(value) =>
        void navigate({ to: visible.find((item) => item.key === value)?.to ?? '/dashboards' })
      }
      options={visible.map((item) => ({ value: item.key, label: t(`tabs.${item.key}`) }))}
    />
  );
}
