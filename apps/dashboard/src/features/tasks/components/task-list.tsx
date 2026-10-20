import { App, Checkbox, Flex, Typography } from 'antd';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { StatusTag } from '@/components/tags';
import { clinicToday } from '@/lib/clinic-time';
import { useSetTaskDoneMutation } from '../tasks.api';
import { bucketOf, type Task, type TaskBucket, type TaskPriority } from '../types';

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  high: 'danger',
  normal: 'info',
  low: 'neutral',
};

const BUCKET_TONE: Record<TaskBucket, Tone> = {
  overdue: 'danger',
  today: 'warning',
  upcoming: 'neutral',
  done: 'success',
};

/**
 * قايمة مهام (D-22): Checkbox للخلاص، العنوان، المرتبط بيه (عميل أو مريض)، اليوم وحالته، والأولوية.
 * `showRelated` بيتقفل جوه Drawer العميل وملف المريض لأن السياق معروف.
 */
export function TaskList({
  tasks,
  showRelated = true,
  canEdit = true,
}: {
  tasks: Task[];
  showRelated?: boolean;
  canEdit?: boolean;
}) {
  const { t } = useTranslation('tasks');
  const locale = useLocale();
  const { message } = App.useApp();
  const [setDone, { isLoading }] = useSetTaskDoneMutation();
  const today = clinicToday();

  const toggle = async (task: Task, done: boolean) => {
    try {
      await setDone({ id: task.id, done }).unwrap();
    } catch {
      void message.error(t('errors.generic'));
    }
  };

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label={t('list.region')}>
      {tasks.map((task) => {
        const bucket = bucketOf(task, today);
        const related = task.related;
        return (
          <li
            key={task.id}
            style={{ padding: '12px 0', borderBlockEnd: '1px solid var(--ant-color-split)' }}
          >
            <Flex gap={12} align="flex-start">
              <Checkbox
                checked={!!task.done_at}
                disabled={!canEdit || isLoading}
                aria-label={t(task.done_at ? 'list.reopen' : 'list.complete', {
                  title: task.title,
                })}
                onChange={(event) => void toggle(task, event.target.checked)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography.Text
                  strong
                  delete={!!task.done_at}
                  type={task.done_at ? 'secondary' : undefined}
                  style={{ display: 'block' }}
                >
                  {task.title}
                </Typography.Text>
                {showRelated && related && (
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {t(`related.${related.type}`)} ·{' '}
                    {related.type === 'patient' ? (
                      <Link to="/patients/$patientId" params={{ patientId: related.id }}>
                        {localized(related, 'name', locale)}
                      </Link>
                    ) : (
                      localized(related, 'name', locale)
                    )}
                  </Typography.Text>
                )}
                {task.notes && (
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {task.notes}
                  </Typography.Text>
                )}
                <Flex gap={6} wrap style={{ marginTop: 6 }}>
                  <StatusTag tone={BUCKET_TONE[bucket]}>
                    {t(`bucketLabel.${bucket}`, { date: formatDate(task.due_on, locale) })}
                  </StatusTag>
                  {task.priority !== 'normal' && (
                    <StatusTag tone={PRIORITY_TONE[task.priority]}>
                      {t(`priorities.${task.priority}`)}
                    </StatusTag>
                  )}
                  {task.assignee && (
                    <Typography.Text type="secondary">
                      {localized(task.assignee, 'name', locale)}
                    </Typography.Text>
                  )}
                </Flex>
              </div>
            </Flex>
          </li>
        );
      })}
    </ul>
  );
}
