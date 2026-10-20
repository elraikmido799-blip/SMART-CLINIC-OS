import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/features/auth/permissions';
import { hasAny, useMe } from '@/features/auth/use-me';

type Section = 'items' | 'codes';

const SECTIONS: { key: Section; to: string; permissions: Permission[] }[] = [
  { key: 'items', to: '/catalog', permissions: ['catalog.read'] },
  { key: 'codes', to: '/catalog/codes', permissions: ['campaigns.manage', 'catalog.write'] },
];

/** التنقل جوه قسم الكتالوج: العناصر (D-24) وأكواد الخصم (D-25). كل تاب حسب الصلاحية */
export function CatalogTabs({ active }: { active: Section }) {
  const { t } = useTranslation('catalog');
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
        void navigate({ to: visible.find((item) => item.key === value)?.to ?? '/catalog' })
      }
      options={visible.map((item) => ({ value: item.key, label: t(`tabs.${item.key}`) }))}
    />
  );
}
