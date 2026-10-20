import { useState } from 'react';
import { Button, Card, Flex, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useCan } from '@/features/auth/use-me';
import { useGetTasksQuery } from '../tasks.api';
import type { TaskRelatedType } from '../types';
import { NewTaskModal } from './task-modal';
import { TaskList } from './task-list';

/**
 * مهام عميل أو مريض (D-22): المفتوحة الأول وبعدها المخلصة، وزرار "مهمة جديدة".
 * بيتحط جوه Drawer العميل (`bare`) وتاب CRM في ملف المريض (جوه Card).
 */
export function RelatedTasks({
  type,
  id,
  branchId,
  bare = false,
}: {
  type: TaskRelatedType;
  id: string;
  branchId: string;
  bare?: boolean;
}) {
  const { t } = useTranslation('tasks');
  const canManage = useCan('tasks.manage');
  const [adding, setAdding] = useState(false);
  const { data, isLoading, isError, refetch } = useGetTasksQuery({
    branch_id: 'all',
    scope: 'all',
    related_type: type,
    related_id: id,
  });

  if (!canManage) return null;

  const tasks = [...(data ?? [])].sort(
    (a, b) => Number(!!a.done_at) - Number(!!b.done_at) || a.due_on.localeCompare(b.due_on),
  );

  const body = isLoading ? (
    <LoadingState />
  ) : isError ? (
    <ErrorState onRetry={() => void refetch()} />
  ) : tasks.length === 0 ? (
    <EmptyState title={t('related.empty')} />
  ) : (
    <TaskList tasks={tasks} showRelated={false} />
  );

  const header = (
    <Flex justify="space-between" align="center" gap={12} style={{ marginBottom: 8 }}>
      <Typography.Title level={2} style={{ fontSize: 16, margin: 0 }}>
        {t('related.title')}
      </Typography.Title>
      <Button size="small" icon={<Plus size={14} aria-hidden />} onClick={() => setAdding(true)}>
        {t('new.button')}
      </Button>
    </Flex>
  );

  const content = (
    <>
      {header}
      {body}
      <NewTaskModal
        branchId={branchId}
        related={{ type, id }}
        open={adding}
        onClose={() => setAdding(false)}
      />
    </>
  );

  return bare ? content : <Card>{content}</Card>;
}
