import { useState } from 'react';
import { Button, Card, Flex, Table, Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber, formatSlot, localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { DangerButton } from '@/components/danger-button';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useGetRefundsQuery } from '../refunds.api';
import { REFUND_STATUSES, type Refund, type RefundStatus } from '../refunds-types';
import { BillingTabs } from './billing-tabs';
import { DecideRefundModal } from './refund-modals';

const STATUS_TONE: Record<RefundStatus, Tone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

/**
 * موافقات المرتجعات (D-27 · docs/20 · 7.4): الطلبات حسب الحالة (مستنية · اتوافق عليها · مرفوضة)، والمحاسب بيوافق أو يرفض
 * (الرفض بسبب إجباري). الريسبشن بيشوف طلباته بس من غير أزرار قرار. الطلب بيتعمل من تفاصيل الفاتورة.
 */
export function RefundsPage() {
  const { t } = useTranslation('billing');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const canApprove = useCan('refunds.approve');
  const [status, setStatus] = useState<RefundStatus>('pending');
  const [deciding, setDeciding] = useState<{ refund: Refund; approve: boolean } | null>(null);
  const refunds = useGetRefundsQuery({ branch_id: branchId });
  const all = refunds.data ?? [];
  const rows = all.filter((refund) => refund.status === status);
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  return (
    <>
      <BillingTabs active="refunds" />
      <PageHeader title={tNav('billing')} description={t('refunds.description')} />
      <Card>
        <Tabs
          activeKey={status}
          onChange={(key) => setStatus(key as RefundStatus)}
          items={REFUND_STATUSES.map((key) => ({
            key,
            label: `${t(`refunds.status.${key}`)} (${formatNumber(
              all.filter((refund) => refund.status === key).length,
              locale,
            )})`,
          }))}
        />
        {refunds.isError ? (
          <ErrorState onRetry={() => void refunds.refetch()} />
        ) : (
          <Table<Refund>
            rowKey="id"
            loading={refunds.isLoading}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t(`refunds.empty.${status}`)} /> }}
            columns={[
              {
                key: 'invoice',
                title: t('refunds.columns.invoice'),
                render: (_, refund) => (
                  <Typography.Text strong dir="ltr">
                    {refund.invoice_number}
                  </Typography.Text>
                ),
              },
              {
                key: 'patient',
                title: t('refunds.columns.patient'),
                render: (_, refund) => localized(refund.patient, 'name', locale),
              },
              {
                key: 'amount',
                title: t('refunds.columns.amount'),
                align: 'end',
                render: (_, refund) => money(refund.amount),
              },
              {
                key: 'reason',
                title: t('refunds.columns.reason'),
                render: (_, refund) => (
                  <>
                    {refund.reason}
                    {refund.decision_note && (
                      <Typography.Text type="secondary" style={{ display: 'block' }}>
                        {refund.decision_note}
                      </Typography.Text>
                    )}
                  </>
                ),
              },
              {
                key: 'requested',
                title: t('refunds.columns.requested'),
                render: (_, refund) => (
                  <>
                    {localized(refund.requested_by, 'name', locale)}
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      {formatSlot(refund.requested_at, locale).day}
                    </Typography.Text>
                  </>
                ),
              },
              {
                key: 'status',
                title: t('refunds.columns.status'),
                render: (_, refund) =>
                  refund.status === 'pending' && canApprove ? (
                    <Flex gap={8}>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setDeciding({ refund, approve: true })}
                      >
                        {t('refunds.decide.approve')}
                      </Button>
                      <DangerButton
                        size="small"
                        onClick={() => setDeciding({ refund, approve: false })}
                      >
                        {t('refunds.decide.reject')}
                      </DangerButton>
                    </Flex>
                  ) : (
                    <StatusTag tone={STATUS_TONE[refund.status]}>
                      {t(`refunds.status.${refund.status}`)}
                    </StatusTag>
                  ),
              },
            ]}
          />
        )}
      </Card>
      <DecideRefundModal
        refund={deciding?.refund ?? null}
        approve={deciding?.approve ?? true}
        onClose={() => setDeciding(null)}
      />
    </>
  );
}
