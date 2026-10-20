import { useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { useGetBranchSettingsQuery } from '../branches.api';
import type { BranchSettings } from '../branch-types';
import { BranchDrawer } from './branch-drawer';
import { SettingsTabs } from './settings-tabs';

/**
 * الفروع والأوض ومواعيد العمل (D-36 · docs/20 · 9.4): قايمة الفروع بعنوانها وتليفونها وعدد أوضها وأيام شغلها،
 * والصف بيفتح الإعدادات (بيانات · مواعيد · أوض). الأدمن بيعدّل، وغيره بيشوف.
 */
export function BranchesPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const canManage = useCan('settings.manage');
  const [editing, setEditing] = useState<BranchSettings | null>(null);
  const branches = useGetBranchSettingsQuery();

  return (
    <>
      <SettingsTabs active="branches" />
      <PageHeader title={tNav('settings')} description={t('branches.description')} />
      <Card>
        {branches.isError ? (
          <ErrorState onRetry={() => void branches.refetch()} />
        ) : (
          <Table<BranchSettings>
            rowKey="id"
            loading={branches.isLoading}
            dataSource={branches.data ?? []}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState /> }}
            onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
            columns={[
              {
                key: 'name',
                title: t('branches.columns.branch'),
                render: (_, item) => (
                  <>
                    <Typography.Text strong style={{ display: 'block' }}>
                      {localized(item, 'name', locale)}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {locale === 'ar' ? item.address_ar : item.address_en}
                    </Typography.Text>
                  </>
                ),
              },
              {
                key: 'phone',
                title: t('branches.phone'),
                render: (_, item) => <span dir="ltr">{item.phone}</span>,
              },
              {
                key: 'rooms',
                title: t('branches.columns.rooms'),
                align: 'end',
                render: (_, item) =>
                  formatNumber(item.rooms.filter((room) => room.active).length, locale),
              },
              {
                key: 'days',
                title: t('branches.columns.days'),
                align: 'end',
                render: (_, item) =>
                  formatNumber(item.hours.filter((entry) => !entry.closed).length, locale),
              },
              {
                key: 'status',
                title: t('branches.columns.status'),
                render: (_, item) => (
                  <StatusTag tone={item.active ? 'success' : 'neutral'}>
                    {t(item.active ? 'branches.activeTag' : 'branches.inactiveTag')}
                  </StatusTag>
                ),
              },
            ]}
          />
        )}
      </Card>
      <BranchDrawer branch={editing} readOnly={!canManage} onClose={() => setEditing(null)} />
    </>
  );
}
