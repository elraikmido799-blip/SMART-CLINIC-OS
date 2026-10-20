import { Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatSlot, localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useGetAuditLogQuery } from '../audit.api';
import type { AuditAction, AuditEntry, AuditQuery } from '../audit-types';

// الأفعال الحساسة بتتلوّن (تصدير · مرتجع · حذف) والباقي هادي
const ACTION_TONE: Record<AuditAction, Tone> = {
  login: 'neutral',
  view: 'info',
  create: 'success',
  update: 'primary',
  delete: 'danger',
  export: 'warning',
  refund: 'warning',
  discount: 'warning',
};

/**
 * جدول سجل العمليات (D-39): الوقت · مين · عمل إيه · على إيه (والسبب لو فتح ملف من بره الفريق). قراءة بس. بيتستخدم في
 * شاشة الإعدادات وفي تاب "الوصول" في ملف المريض.
 */
export function AuditTable({ query }: { query: AuditQuery }) {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const log = useGetAuditLogQuery(query);

  if (log.isError) return <ErrorState onRetry={() => void log.refetch()} />;

  return (
    <Table<AuditEntry>
      rowKey="id"
      loading={log.isFetching}
      dataSource={log.data ?? []}
      pagination={{ pageSize: 20, hideOnSinglePage: true, showSizeChanger: false }}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <EmptyState title={t('audit.empty')} /> }}
      columns={[
        {
          key: 'at',
          title: t('audit.columns.at'),
          render: (_, entry) => {
            const slot = formatSlot(entry.at, locale);
            return `${slot.day} · ${slot.time}`;
          },
        },
        {
          key: 'actor',
          title: t('audit.columns.actor'),
          render: (_, entry) => (
            <>
              {localized(entry.actor, 'name', locale)}
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                {tCommon(`roles.${entry.actor.role as 'admin'}`)}
              </Typography.Text>
            </>
          ),
        },
        {
          key: 'action',
          title: t('audit.columns.action'),
          render: (_, entry) => (
            <StatusTag tone={ACTION_TONE[entry.action]}>
              {t(`audit.actions.${entry.action}`)}
            </StatusTag>
          ),
        },
        {
          key: 'entity',
          title: t('audit.columns.entity'),
          render: (_, entry) => (
            <>
              {t(`audit.entities.${entry.entity}`)}
              <Typography.Text type="secondary" style={{ display: 'block' }} dir="auto">
                {entry.entity_label}
              </Typography.Text>
            </>
          ),
        },
        {
          key: 'reason',
          title: t('audit.columns.reason'),
          render: (_, entry) =>
            entry.reason ? <StatusTag tone="warning">{t('audit.breakGlass')}</StatusTag> : '—',
        },
      ]}
    />
  );
}
