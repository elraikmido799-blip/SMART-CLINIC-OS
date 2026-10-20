import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Flex,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
} from 'antd';
import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatSlot } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { FrontDeskTabs } from '@/features/front-desk/components/front-desk-tabs';
import { apiErrorCode } from '@/lib/api-error';
import { clinicToday } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { useCloseCashMutation, useGetCashClosingQuery } from '../closing.api';
import { PAYMENT_METHODS, type MethodAmounts, type PaymentMethod } from '../types';

type Counted = Record<PaymentMethod, number | null>;
const EMPTY: Counted = { cash: null, card: null, wallet: null, instapay: null };

const KNOWN_ERRORS = ['REASON_REQUIRED', 'ALREADY_CLOSED', 'INVALID_AMOUNT', 'FORBIDDEN'] as const;
type ErrorKey = `errors.${(typeof KNOWN_ERRORS)[number] | 'generic'}`;
const errorKeyOf = (error: unknown): ErrorKey => {
  const code = apiErrorCode(error as never) ?? '';
  return (KNOWN_ERRORS as readonly string[]).includes(code)
    ? (`errors.${code}` as ErrorKey)
    : 'errors.generic';
};

// الجنيه ↔ القروش (الـAPI بالقروش، والكاشير بيكتب جنيهات)
const toMinor = (pounds: number) => Math.round(pounds * 100);
const sum = (amounts: MethodAmounts) => Object.values(amounts).reduce((a, b) => a + b, 0);

/**
 * تقفيل الخزنة (D-07 · docs/20 · 3.7): اللي اتحصّل في السيستم حسب طريقة الدفع ضد اللي الكاشير عدّه فعلًا.
 * فيه فرق = السبب إجباري. بعد التقفيل الشاشة للعرض والطباعة بس.
 */
export function ClosingPage() {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const { message } = App.useApp();
  const { branchId } = useBranchScope();
  const scoped = branchId !== ALL_BRANCHES;
  const date = clinicToday();
  const closing = useGetCashClosingQuery({ branch_id: branchId, date }, { skip: !scoped });
  const [closeCash, closeState] = useCloseCashMutation();
  const [counted, setCounted] = useState<Counted>(EMPTY);
  const [reason, setReason] = useState('');
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  const header = (
    <>
      <PageHeader title={t('closing.title')} description={t('closing.description')} />
      <FrontDeskTabs />
    </>
  );

  if (!scoped) {
    return (
      <>
        {header}
        <Card>
          <EmptyState title={t('closing.pickBranch')} description={t('closing.pickBranchBody')} />
        </Card>
      </>
    );
  }
  if (closing.isLoading) {
    return (
      <>
        {header}
        <LoadingState />
      </>
    );
  }
  if (closing.isError || !closing.data) {
    return (
      <>
        {header}
        <ErrorState onRetry={() => void closing.refetch()} />
      </>
    );
  }

  const data = closing.data;
  const done = data.closing;
  const methodLabel = (method: PaymentMethod) => t(`pos.methods.${method}`);
  const diffTag = (diff: number) => (
    <StatusTag tone={diff === 0 ? 'success' : diff < 0 ? 'danger' : 'warning'}>
      {diff === 0 ? t('closing.matches') : `${diff > 0 ? '+' : '−'} ${money(Math.abs(diff))}`}
    </StatusTag>
  );
  const rows = PAYMENT_METHODS.map((method) => ({ method }));

  if (done) {
    const closedAt = formatSlot(done.closed_at, locale);
    return (
      <>
        {header}
        <Card>
          <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
            <StatusTag tone="success">{t('closing.closedTag')}</StatusTag>
            <Button
              type="primary"
              icon={<Printer size={16} aria-hidden />}
              onClick={() => window.print()}
            >
              {t('closing.print')}
            </Button>
          </Flex>
          <div className="print-area" style={{ maxWidth: 720 }}>
            <Typography.Title level={2} style={{ fontSize: 20 }}>
              {t('closing.printTitle')} · {data.date}
            </Typography.Title>
            <Table
              size="small"
              rowKey="method"
              pagination={false}
              scroll={{ x: 'max-content' }}
              dataSource={rows}
              columns={[
                { key: 'm', title: t('pos.method'), render: (_, row) => methodLabel(row.method) },
                {
                  key: 'e',
                  title: t('closing.expected'),
                  render: (_, row) => money(data.expected[row.method]),
                },
                {
                  key: 'c',
                  title: t('closing.counted'),
                  render: (_, row) => money(done.counted[row.method]),
                },
                {
                  key: 'd',
                  title: t('closing.difference'),
                  render: (_, row) => diffTag(done.counted[row.method] - data.expected[row.method]),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>{t('closing.total')}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{money(sum(data.expected))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>{money(sum(done.counted))}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>{diffTag(done.difference)}</Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            <Descriptions
              size="small"
              column={1}
              style={{ marginTop: 16 }}
              items={[
                {
                  key: 'by',
                  label: t('closing.closedBy'),
                  children: locale === 'ar' ? done.closed_by_name_ar : done.closed_by_name_en,
                },
                {
                  key: 'at',
                  label: t('closing.closedAt'),
                  children: `${closedAt.day} ${closedAt.time}`,
                },
                { key: 'n', label: t('closing.invoices'), children: data.invoices_count },
                ...(done.reason
                  ? [{ key: 'r', label: t('closing.reason'), children: done.reason }]
                  : []),
              ]}
            />
          </div>
        </Card>
      </>
    );
  }

  const filled = PAYMENT_METHODS.every((method) => counted[method] !== null);
  const countedMinor = Object.fromEntries(
    PAYMENT_METHODS.map((method) => [method, toMinor(counted[method] ?? 0)]),
  ) as MethodAmounts;
  const difference = sum(countedMinor) - sum(data.expected);
  const needsReason = filled && difference !== 0;
  const canClose = filled && (!needsReason || reason.trim().length > 0);

  const fillExpected = () =>
    setCounted(
      Object.fromEntries(PAYMENT_METHODS.map((m) => [m, data.expected[m] / 100])) as Counted,
    );

  const submit = async () => {
    setErrorKey(null);
    try {
      await closeCash({
        branch_id: branchId,
        date,
        counted: countedMinor,
        reason: needsReason ? reason.trim() : null,
      }).unwrap();
      void message.success(t('closing.done'));
    } catch (error) {
      setErrorKey(errorKeyOf(error));
    }
  };

  return (
    <>
      {header}
      <Card>
        <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary">
            {t('closing.today', { date: data.date, count: data.invoices_count })}
          </Typography.Text>
          <Button onClick={fillExpected}>{t('closing.fillExpected')}</Button>
        </Flex>
        <Table
          scroll={{ x: 'max-content' }}
          size="small"
          rowKey="method"
          pagination={false}
          dataSource={rows}
          columns={[
            { key: 'm', title: t('pos.method'), render: (_, row) => methodLabel(row.method) },
            {
              key: 'e',
              title: t('closing.expected'),
              render: (_, row) => money(data.expected[row.method]),
            },
            {
              key: 'c',
              title: t('closing.counted'),
              render: (_, row) => (
                <InputNumber
                  aria-label={`${t('closing.counted')}: ${methodLabel(row.method)}`}
                  min={0}
                  step={50}
                  placeholder="0"
                  value={counted[row.method]}
                  onChange={(value) => setCounted({ ...counted, [row.method]: value })}
                  style={{ width: 140 }}
                />
              ),
            },
            {
              key: 'd',
              title: t('closing.difference'),
              render: (_, row) =>
                counted[row.method] === null
                  ? '—'
                  : diffTag(toMinor(counted[row.method] ?? 0) - data.expected[row.method]),
            },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <strong>{t('closing.total')}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>{money(sum(data.expected))}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                {filled ? <strong>{money(sum(countedMinor))}</strong> : '—'}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                {filled ? diffTag(difference) : '—'}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
        {needsReason && (
          <Flex vertical gap={6} style={{ marginTop: 16 }}>
            <Typography.Text strong>{t('closing.reason')}</Typography.Text>
            <Input.TextArea
              aria-label={t('closing.reason')}
              rows={2}
              maxLength={300}
              value={reason}
              placeholder={t('closing.reasonPlaceholder')}
              onChange={(event) => setReason(event.target.value)}
            />
          </Flex>
        )}
        {errorKey && (
          <Alert type="error" showIcon role="alert" title={t(errorKey)} style={{ marginTop: 16 }} />
        )}
        <Popconfirm
          title={t('closing.confirmTitle')}
          description={t('closing.confirmBody')}
          okText={t('closing.submit')}
          cancelText={t('closing.cancel')}
          disabled={!canClose}
          onConfirm={submit}
        >
          <Button
            type="primary"
            size="large"
            disabled={!canClose}
            loading={closeState.isLoading}
            style={{ marginTop: 16 }}
          >
            {t('closing.submit')}
          </Button>
        </Popconfirm>
      </Card>
    </>
  );
}
