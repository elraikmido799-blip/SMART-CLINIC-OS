import { useState } from 'react';
import { Button, Card, Col, Flex, Row, Segmented, Tabs } from 'antd';
import { CalendarClock, CircleAlert, ListTodo, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { CrmTabs } from '@/features/crm/components/crm-tabs';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { clinicToday } from '@/lib/clinic-time';
import { useGetTasksQuery } from '../tasks.api';
import { TASK_BUCKETS, bucketOf, type TaskBucket } from '../types';
import { TaskList } from './task-list';
import { NewTaskModal } from './task-modal';

/**
 * المهام والمتابعات (D-22 · docs/20 · 6.3): "مهامي" أو "كل الفرع" · 3 أرقام (النهارده · المتأخرة · الجاية) ·
 * تابات: المتأخرة · النهارده · الجاية · المخلصة. المهمة بتتربط بعميل أو مريض، وبتتعمل من هنا أو من ملفهم.
 */
export function TasksPage() {
  const { t } = useTranslation('tasks');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const [bucket, setBucket] = useState<TaskBucket>('today');
  const [creating, setCreating] = useState(false);
  const tasks = useGetTasksQuery({ branch_id: branchId, scope });
  const today = clinicToday();

  const all = tasks.data ?? [];
  const byBucket = (key: TaskBucket) => all.filter((task) => bucketOf(task, today) === key);
  const shown = byBucket(bucket);

  return (
    <>
      <CrmTabs active="tasks" />
      <PageHeader
        title={t('title')}
        description={t('description')}
        extra={
          branchId !== 'all' ? (
            <Button
              type="primary"
              icon={<Plus size={16} aria-hidden />}
              onClick={() => setCreating(true)}
            >
              {t('new.button')}
            </Button>
          ) : undefined
        }
      />
      <Flex style={{ marginBottom: 16 }}>
        <Segmented
          aria-label={t('scope.label')}
          value={scope}
          onChange={setScope}
          options={[
            { value: 'mine', label: t('scope.mine') },
            { value: 'all', label: t('scope.all') },
          ]}
        />
      </Flex>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            icon={<ListTodo size={20} />}
            label={t('kpi.today')}
            value={formatNumber(byBucket('today').length, locale)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<CircleAlert size={20} />}
            label={t('kpi.overdue')}
            value={formatNumber(byBucket('overdue').length, locale)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<CalendarClock size={20} />}
            label={t('kpi.upcoming')}
            value={formatNumber(byBucket('upcoming').length, locale)}
          />
        </Col>
      </Row>
      <Card>
        <Tabs
          activeKey={bucket}
          onChange={(key) => setBucket(key as TaskBucket)}
          items={TASK_BUCKETS.map((key) => ({
            key,
            label: `${t(`buckets.${key}`)} (${formatNumber(byBucket(key).length, locale)})`,
          }))}
        />
        {tasks.isLoading ? (
          <LoadingState />
        ) : tasks.isError ? (
          <ErrorState onRetry={() => void tasks.refetch()} />
        ) : shown.length === 0 ? (
          <EmptyState title={t(`empty.${bucket}`)} />
        ) : (
          <TaskList tasks={shown} />
        )}
      </Card>
      {branchId !== 'all' && (
        <NewTaskModal branchId={branchId} open={creating} onClose={() => setCreating(false)} />
      )}
    </>
  );
}
