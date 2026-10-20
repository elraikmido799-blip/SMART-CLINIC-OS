import { useState } from 'react';
import { Button, Card, Col, Drawer, Flex, Input, Row, Select, Table, Typography } from 'antd';
import { Banknote, Receipt, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber, formatSlot, localized } from '@oxygen/shared';
import type { Tone } from '@/app/tones';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useDebounced } from '@/lib/use-debounced';
import { useCan } from '@/features/auth/use-me';
import { useGetInvoicesQuery } from '../invoices.api';
import { useGetRefundsQuery } from '../refunds.api';
import {
  PAYMENT_METHODS,
  invoiceStatusOf,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
} from '../types';
import { BillingTabs } from './billing-tabs';
import { InvoiceView } from './invoice-view';
import { RequestRefundModal } from './refund-modals';

const STATUS_TONE: Record<InvoiceStatus, Tone> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

const PERIODS = [
  { value: 1, key: 'today' },
  { value: 7, key: 'week' },
  { value: 30, key: 'month' },
  { value: 0, key: 'all' },
] as const;

const STATUSES: readonly InvoiceStatus[] = ['paid', 'partial', 'unpaid'];

/**
 * الفواتير والمدفوعات (D-26 · docs/20 · 7.3): جدول بفلاتر (الفترة · طريقة الدفع · الحالة · بحث برقم الفاتورة أو المريض)،
 * 3 أرقام (المبيعات · المحصّل · المتبقي)، والصف بيفتح الفاتورة كاملة (نفس شكل الكاشير وقابلة للطباعة).
 */
export function InvoicesPage() {
  const { t } = useTranslation('billing');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const [days, setDays] = useState<number>(7);
  const [method, setMethod] = useState<PaymentMethod>();
  const [status, setStatus] = useState<InvoiceStatus>();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [refunding, setRefunding] = useState(false);
  const canRequestRefund = useCan('refunds.request');
  const refunds = useGetRefundsQuery({ branch_id: 'all' }, { skip: !canRequestRefund });
  const search = useDebounced(query.trim());
  const invoices = useGetInvoicesQuery({
    branch_id: branchId,
    days,
    method,
    status,
    q: search || undefined,
  });

  const rows = invoices.data ?? [];
  const sales = rows.reduce((sum, row) => sum + row.total, 0);
  const collected = rows.reduce((sum, row) => sum + row.paid, 0);
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  return (
    <>
      <BillingTabs active="invoices" />
      <PageHeader title={tNav('billing')} description={t('invoices.description')} />
      <Card style={{ marginBottom: 16 }}>
        <Flex wrap gap={12} align="center">
          <Select
            aria-label={t('invoices.filters.period')}
            value={days}
            onChange={setDays}
            options={PERIODS.map((item) => ({
              value: item.value,
              label: t(`invoices.periods.${item.key}`),
            }))}
            style={{ minWidth: 150 }}
          />
          <Select
            allowClear
            aria-label={t('invoices.filters.method')}
            placeholder={t('invoices.filters.method')}
            value={method}
            onChange={setMethod}
            options={PAYMENT_METHODS.map((value) => ({
              value,
              label: t(`pos.methods.${value}`),
            }))}
            style={{ minWidth: 150 }}
          />
          <Select
            allowClear
            aria-label={t('invoices.filters.status')}
            placeholder={t('invoices.filters.status')}
            value={status}
            onChange={setStatus}
            options={STATUSES.map((value) => ({
              value,
              label: t(`invoices.status.${value}`),
            }))}
            style={{ minWidth: 150 }}
          />
          <Input
            type="search"
            allowClear
            aria-label={t('invoices.filters.search')}
            placeholder={t('invoices.filters.search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ flex: '1 1 220px', maxWidth: 300 }}
          />
        </Flex>
      </Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Receipt size={20} />}
            label={t('invoices.kpi.sales', { count: rows.length })}
            value={money(sales)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Banknote size={20} />}
            label={t('invoices.kpi.collected')}
            value={money(collected)}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            icon={<Wallet size={20} />}
            label={t('invoices.kpi.outstanding')}
            value={money(Math.max(0, sales - collected))}
          />
        </Col>
      </Row>
      <Card>
        {invoices.isError ? (
          <ErrorState onRetry={() => void invoices.refetch()} />
        ) : (
          <Table<Invoice>
            rowKey="id"
            loading={invoices.isFetching}
            dataSource={rows}
            pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('invoices.empty')} /> }}
            onRow={(invoice) => ({
              onClick: () => setSelected(invoice),
              style: { cursor: 'pointer' },
            })}
            columns={[
              {
                key: 'number',
                title: t('invoices.columns.number'),
                render: (_, invoice) => (
                  <Typography.Text strong dir="ltr">
                    {invoice.number}
                  </Typography.Text>
                ),
              },
              {
                key: 'date',
                title: t('invoices.columns.date'),
                render: (_, invoice) => {
                  const slot = formatSlot(invoice.created_at, locale);
                  return `${slot.day} · ${slot.time}`;
                },
              },
              {
                key: 'patient',
                title: t('invoices.columns.patient'),
                render: (_, invoice) => localized(invoice.patient, 'name', locale),
              },
              {
                key: 'method',
                title: t('invoices.columns.method'),
                render: (_, invoice) => t(`pos.methods.${invoice.method}`),
              },
              {
                key: 'total',
                title: t('invoices.columns.total'),
                align: 'end',
                render: (_, invoice) => money(invoice.total),
              },
              {
                key: 'paid',
                title: t('invoices.columns.paid'),
                align: 'end',
                render: (_, invoice) => money(invoice.paid),
              },
              {
                key: 'status',
                title: t('invoices.columns.status'),
                render: (_, invoice) => {
                  const state = invoiceStatusOf(invoice);
                  return (
                    <StatusTag tone={STATUS_TONE[state]}>{t(`invoices.status.${state}`)}</StatusTag>
                  );
                },
              },
            ]}
          />
        )}
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
          {t('invoices.count', { count: formatNumber(rows.length, locale) })}
        </Typography.Text>
      </Card>
      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        destroyOnHidden
        size={480}
        title={selected?.number}
      >
        {selected && (
          <>
            <InvoiceView invoice={selected} printable />
            {canRequestRefund && (
              <Button block style={{ marginTop: 16 }} onClick={() => setRefunding(true)}>
                {t('refunds.request.button')}
              </Button>
            )}
            <RequestRefundModal
              invoice={selected}
              refundable={
                selected.paid -
                (refunds.data ?? [])
                  .filter((item) => item.invoice_id === selected.id && item.status !== 'rejected')
                  .reduce((sum, item) => sum + item.amount, 0)
              }
              open={refunding}
              onClose={() => setRefunding(false)}
            />
          </>
        )}
      </Drawer>
    </>
  );
}
