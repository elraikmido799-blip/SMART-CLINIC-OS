import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Permission } from '@/features/auth/permissions';
import { useMe, hasAny } from '@/features/auth/use-me';

type Section = 'pipeline' | 'tasks' | 'campaigns';

const SECTIONS: { key: Section; to: string; permission: Permission }[] = [
  { key: 'pipeline', to: '/crm', permission: 'leads.read' },
  { key: 'tasks', to: '/crm/tasks', permission: 'tasks.manage' },
  { key: 'campaigns', to: '/crm/campaigns', permission: 'campaigns.read' },
];

/** التنقل جوه قسم الـCRM: العملاء · المهام (D-22) · الحملات (D-23). كل تاب حسب الصلاحية، ولو واحد بس مبيظهرش */
export function CrmTabs({ active }: { active: Section }) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const me = useMe();
  const visible = SECTIONS.filter((item) => hasAny(me, [item.permission]));

  if (visible.length < 2) return null;

  return (
    <div style={{ overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
      <Segmented
        aria-label={t('tabs.label')}
        value={active}
        onChange={(value) =>
          void navigate({ to: visible.find((item) => item.key === value)?.to ?? '/crm' })
        }
        options={visible.map((item) => ({ value: item.key, label: t(`tabs.${item.key}`) }))}
      />
    </div>
  );
}
