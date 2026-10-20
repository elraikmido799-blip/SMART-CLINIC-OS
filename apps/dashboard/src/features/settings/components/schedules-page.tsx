import { useState } from 'react';
import { Card, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatNumber, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { SpecialtyTag } from '@/components/tags';
import { clinicToday } from '@/lib/clinic-time';
import { useGetDoctorSchedulesQuery } from '../schedules.api';
import type { DoctorSchedule } from '../schedule-types';
import { ScheduleDrawer } from './schedule-drawer';
import { SettingsTabs } from './settings-tabs';

/**
 * جداول الدكاترة والإجازات (D-37 · docs/20 · 9.5): كل دكتور بأيام شغله وإجازاته الجاية، والصف بيفتح الجدول الأسبوعي
 * والإجازات (مع تحذير لو فيها مواعيد محجوزة). مدير الفرع بيشوف دكاترة فرعه، والأدمن الكل.
 */
export function SchedulesPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const [editing, setEditing] = useState<DoctorSchedule | null>(null);
  const schedules = useGetDoctorSchedulesQuery();
  const today = clinicToday();

  return (
    <>
      <SettingsTabs active="schedules" />
      <PageHeader title={tNav('settings')} description={t('schedules.description')} />
      <Card>
        {schedules.isError ? (
          <ErrorState onRetry={() => void schedules.refetch()} />
        ) : (
          <Table<DoctorSchedule>
            rowKey="practitioner_id"
            loading={schedules.isLoading}
            dataSource={schedules.data ?? []}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState /> }}
            onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
            columns={[
              {
                key: 'name',
                title: t('schedules.columns.doctor'),
                render: (_, item) => localized(item, 'name', locale),
              },
              {
                key: 'specialty',
                title: t('schedules.columns.specialty'),
                render: (_, item) => <SpecialtyTag specialty={item.specialty} />,
              },
              {
                key: 'days',
                title: t('schedules.columns.days'),
                align: 'end',
                render: (_, item) =>
                  formatNumber(item.weekly.filter((entry) => !entry.off).length, locale),
              },
              {
                key: 'leaves',
                title: t('schedules.columns.leaves'),
                align: 'end',
                render: (_, item) =>
                  formatNumber(item.leaves.filter((leave) => leave.to >= today).length, locale),
              },
            ]}
          />
        )}
      </Card>
      <ScheduleDrawer schedule={editing} onClose={() => setEditing(null)} />
    </>
  );
}
