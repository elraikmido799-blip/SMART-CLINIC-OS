import { Segmented } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/features/auth/use-me';

/** التنقل جوه قسم الـCRM: الـPipeline (لمين يقدر يشوف العملاء) والمهام (D-22) */
export function CrmTabs({ active }: { active: 'pipeline' | 'tasks' }) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const canLeads = useCan('leads.read');
  const canTasks = useCan('tasks.manage');

  if (!canLeads || !canTasks) return null;

  return (
    <Segmented
      aria-label={t('tabs.label')}
      value={active}
      style={{ marginBottom: 16 }}
      onChange={(value) => void navigate({ to: value === 'tasks' ? '/crm/tasks' : '/crm' })}
      options={[
        { value: 'pipeline', label: t('tabs.pipeline') },
        { value: 'tasks', label: t('tabs.tasks') },
      ]}
    />
  );
}
