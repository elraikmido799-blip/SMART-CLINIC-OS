import { useState } from 'react';
import { Card, Table, Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { useGetNotificationTemplatesQuery } from '../settings.api';
import {
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationTemplate,
} from '../notification-types';
import { SettingsTabs } from './settings-tabs';
import { TemplateEditor } from './template-editor';

/**
 * قوالب الإشعارات (D-34 · docs/20 · 9.2): واتساب · SMS · إيميل، لكل حدث (تأكيد حجز · تذكير · إيصال…) بالعربي والإنجليزي.
 * الصف بيفتح المحرر (متغيرات + معاينة). تعديل نص الواتساب بيرجع للمراجعة عند واتساب. للأدمن تعديل، وغيره عرض.
 */
export function TemplatesPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const canManage = useCan('settings.manage');
  const [channel, setChannel] = useState<NotificationChannel>('whatsapp');
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const templates = useGetNotificationTemplatesQuery();
  const all = templates.data ?? [];
  const rows = all.filter((item) => item.channel === channel);

  return (
    <>
      <SettingsTabs active="templates" />
      <PageHeader title={tNav('settings')} description={t('templates.description')} />
      <Card>
        <Tabs
          activeKey={channel}
          onChange={(key) => setChannel(key as NotificationChannel)}
          items={NOTIFICATION_CHANNELS.map((key) => ({
            key,
            label: `${t(`templates.channels.${key}`)} (${all.filter((item) => item.channel === key).length})`,
          }))}
        />
        {templates.isError ? (
          <ErrorState onRetry={() => void templates.refetch()} />
        ) : (
          <Table<NotificationTemplate>
            rowKey="id"
            loading={templates.isLoading}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('templates.empty')} /> }}
            onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
            columns={[
              {
                key: 'event',
                title: t('templates.columns.event'),
                render: (_, item) => (
                  <>
                    <Typography.Text strong style={{ display: 'block' }}>
                      {t(`templates.events.${item.event}`)}
                    </Typography.Text>
                    <Typography.Text type="secondary" ellipsis style={{ maxWidth: 420 }}>
                      {locale === 'ar' ? item.body_ar : item.body_en}
                    </Typography.Text>
                  </>
                ),
              },
              {
                key: 'status',
                title: t('templates.columns.status'),
                render: (_, item) => (
                  <>
                    <StatusTag tone={item.active ? 'success' : 'neutral'}>
                      {t(item.active ? 'templates.on' : 'templates.off')}
                    </StatusTag>
                    {item.approval === 'pending' && (
                      <StatusTag tone="warning">{t('templates.pending')}</StatusTag>
                    )}
                  </>
                ),
              },
            ]}
          />
        )}
      </Card>
      <TemplateEditor template={editing} readOnly={!canManage} onClose={() => setEditing(null)} />
    </>
  );
}
