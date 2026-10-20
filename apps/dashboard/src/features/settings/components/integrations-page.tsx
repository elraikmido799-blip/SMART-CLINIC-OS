import { App, Button, Card, Flex, Switch, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import {
  useGetIntegrationsQuery,
  useSetIntegrationMutation,
  useTestIntegrationMutation,
} from '../integrations.api';
import type { IntegrationStatus } from '../integration-types';
import { SettingsTabs } from './settings-tabs';

const STATUS_TONE: Record<IntegrationStatus, Tone> = {
  connected: 'success',
  not_configured: 'neutral',
  error: 'danger',
};

/**
 * الربط مع الخدمات (D-38 · docs/20 · 9.6): كارت لكل خدمة (دفع · واتساب · SMS · إيميل · Meta · TikTok · تحليلات · خرايط…)
 * بحالتها (متوصّلة · لسه متضبطتش · خطأ) وتفعيل/إيقاف و"اختبر الاتصال". شاشة حالة بس: المفاتيح بتتحط في الباك ومبتظهرش هنا.
 */
export function IntegrationsPage() {
  const { t } = useTranslation('settings');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { message } = App.useApp();
  const canManage = useCan('settings.manage');
  const integrations = useGetIntegrationsQuery();
  const [setEnabled, setState] = useSetIntegrationMutation();
  const [test, testState] = useTestIntegrationMutation();

  const toggle = async (key: Parameters<typeof setEnabled>[0]['key'], enabled: boolean) => {
    try {
      await setEnabled({ key, enabled }).unwrap();
    } catch (error) {
      void message.error(
        apiErrorCode(error as never) === 'NOT_CONFIGURED'
          ? t('integrations.notConfiguredHint')
          : t('integrations.failed'),
      );
    }
  };

  return (
    <>
      <SettingsTabs active="integrations" />
      <PageHeader title={tNav('settings')} description={t('integrations.description')} />
      {integrations.isLoading ? (
        <LoadingState />
      ) : integrations.isError ? (
        <ErrorState onRetry={() => void integrations.refetch()} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {(integrations.data ?? []).map((item) => (
            <Card key={item.key} styles={{ body: { padding: 16 } }}>
              <Flex justify="space-between" align="start" gap={8}>
                <div>
                  <Typography.Text strong style={{ display: 'block' }}>
                    {t(`integrations.items.${item.key}.name`)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {t(`integrations.items.${item.key}.purpose`)}
                  </Typography.Text>
                </div>
                <Switch
                  checked={item.enabled}
                  disabled={!canManage || setState.isLoading}
                  aria-label={t('integrations.toggle', {
                    name: t(`integrations.items.${item.key}.name`),
                  })}
                  onChange={(checked) => void toggle(item.key, checked)}
                />
              </Flex>
              <Flex gap={6} wrap align="center" style={{ marginTop: 12 }}>
                <StatusTag tone={STATUS_TONE[item.status]}>
                  {t(`integrations.status.${item.status}`)}
                </StatusTag>
                {item.phase === 'p2' && (
                  <StatusTag tone="neutral">{t('integrations.phase2')}</StatusTag>
                )}
              </Flex>
              <Flex justify="space-between" align="center" gap={8} style={{ marginTop: 12 }}>
                <Typography.Text type="secondary">
                  {item.checked_at
                    ? t('integrations.checked', {
                        date: formatDate(item.checked_at.slice(0, 10), locale),
                      })
                    : t('integrations.neverChecked')}
                </Typography.Text>
                {canManage && (
                  <Button
                    size="small"
                    loading={testState.isLoading && testState.originalArgs === item.key}
                    onClick={() => void test(item.key)}
                  >
                    {t('integrations.test')}
                  </Button>
                )}
              </Flex>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
