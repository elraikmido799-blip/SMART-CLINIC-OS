import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/features/auth/permissions';
import { hasAny, useMe } from '@/features/auth/use-me';

type Section = 'invoices' | 'refunds';

const SECTIONS: { key: Section; to: string; permissions: Permission[] }[] = [
  { key: 'invoices', to: '/billing', permissions: ['billing.read'] },
  { key: 'refunds', to: '/billing/refunds', permissions: ['refunds.request', 'refunds.approve'] },
];

/** التنقل جوه قسم الحسابات: الفواتير (D-26) والمرتجعات (D-27). كل تاب حسب الصلاحية */
export function BillingTabs({ active }: { active: Section }) {
  const { t } = useTranslation('billing');
  const navigate = useNavigate();
  const me = useMe();
  const visible = SECTIONS.filter((item) => hasAny(me, item.permissions));

  if (visible.length < 2) return null;

  return (
    <Segmented
      aria-label={t('sections.label')}
      value={active}
      style={{ marginBottom: 16 }}
      onChange={(value) =>
        void navigate({ to: visible.find((item) => item.key === value)?.to ?? '/billing' })
      }
      options={visible.map((item) => ({ value: item.key, label: t(`sections.${item.key}`) }))}
    />
  );
}
