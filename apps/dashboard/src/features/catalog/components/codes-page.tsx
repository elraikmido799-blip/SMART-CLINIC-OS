import { useState } from 'react';
import { Button, Card, Table, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney, formatNumber } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { clinicToday } from '@/lib/clinic-time';
import { useGetDiscountCodesQuery } from '../codes.api';
import { codeStateOf, type CodeState, type DiscountCode } from '../codes-types';
import { CatalogTabs } from './catalog-tabs';
import { CodeModal } from './code-modal';

const STATE_TONE: Record<CodeState, Tone> = {
  active: 'success',
  scheduled: 'info',
  expired: 'neutral',
  exhausted: 'warning',
  off: 'neutral',
};

/**
 * أكواد الخصم (D-25 · docs/20 · 7.2): نسبة أو مبلغ · الفترة · أقصى استخدامات · بتتطبق على إيه · الحالة النهارده.
 * الضغط على الكود بيفتح التعديل. الكاشير بيفحص الكود من نفس الداتا.
 */
export function CodesPage() {
  const { t } = useTranslation('catalog');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const codes = useGetDiscountCodesQuery();
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [creating, setCreating] = useState(false);
  const today = clinicToday();

  return (
    <>
      <CatalogTabs active="codes" />
      <PageHeader
        title={tNav('catalog')}
        description={t('codes.description')}
        extra={
          <Button
            type="primary"
            icon={<Plus size={16} aria-hidden />}
            onClick={() => setCreating(true)}
          >
            {t('codes.new')}
          </Button>
        }
      />
      <Card>
        {codes.isError ? (
          <ErrorState onRetry={() => void codes.refetch()} />
        ) : (
          <Table<DiscountCode>
            rowKey="id"
            loading={codes.isLoading}
            dataSource={codes.data ?? []}
            pagination={false}
            scroll={{ x: 760 }}
            locale={{ emptyText: <EmptyState title={t('codes.empty')} /> }}
            onRow={(item) => ({ onClick: () => setEditing(item), style: { cursor: 'pointer' } })}
            columns={[
              {
                key: 'code',
                title: t('codes.code'),
                render: (_, item) => (
                  <Typography.Text strong dir="ltr">
                    {item.code}
                  </Typography.Text>
                ),
              },
              {
                key: 'value',
                title: t('codes.discount'),
                render: (_, item) =>
                  item.type === 'percent'
                    ? `${formatNumber(item.value, locale)}%`
                    : formatMoney(item.value, 'EGP', locale),
              },
              {
                key: 'applies',
                title: t('codes.appliesTo'),
                render: (_, item) => t(`codes.applies.${item.applies_to}`),
              },
              {
                key: 'period',
                title: t('codes.period'),
                render: (_, item) =>
                  `${formatDate(item.starts_on, locale)} → ${
                    item.ends_on ? formatDate(item.ends_on, locale) : t('codes.noEnd')
                  }`,
              },
              {
                key: 'uses',
                title: t('codes.uses'),
                align: 'end',
                render: (_, item) =>
                  item.max_uses === null
                    ? formatNumber(item.used, locale)
                    : `${formatNumber(item.used, locale)} / ${formatNumber(item.max_uses, locale)}`,
              },
              {
                key: 'state',
                title: t('codes.state'),
                render: (_, item) => {
                  const state = codeStateOf(item, today);
                  return (
                    <StatusTag tone={STATE_TONE[state]}>{t(`codes.states.${state}`)}</StatusTag>
                  );
                },
              },
            ]}
          />
        )}
      </Card>
      <CodeModal code={editing} open={editing !== null} onClose={() => setEditing(null)} />
      <CodeModal code={null} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
