import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/features/auth/permissions';
import { hasAny, useMe } from '@/features/auth/use-me';

type Section = 'executive' | 'branch' | 'journey';

const SECTIONS: { key: Section; to: string; permissions: Permission[] }[] = [
  { key: 'executive', to: '/dashboards', permissions: ['dashboards.all'] },
  { key: 'branch', to: '/dashboards/branch', permissions: ['dashboards.branch', 'dashboards.all'] },
  {
    key: 'journey',
    to: '/dashboards/journey',
    permissions: ['dashboards.all', 'dashboards.branch'],
  },
];

/** التنقل جوه الداشبوردات: الـCEO (D-28) · الفرع (D-29) · رحلة المريض (D-30). كل تاب حسب الصلاحية */
export function DashboardTabs({ active }: { active: Section }) {
  const { t } = useTranslation('dashboards');
  const navigate = useNavigate();
  const me = useMe();
  const visible = SECTIONS.filter((item) => hasAny(me, item.permissions));

  if (visible.length < 2) return null;

  return (
    <div style={{ overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
      <Segmented
        aria-label={t('tabs.label')}
        value={active}
        onChange={(value) =>
          void navigate({ to: visible.find((item) => item.key === value)?.to ?? '/dashboards' })
        }
        options={visible.map((item) => ({ value: item.key, label: t(`tabs.${item.key}`) }))}
      />
    </div>
  );
}
