import { useState } from 'react';
import { Card, Drawer, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatSlot } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useGetInvoicesQuery } from '../invoices.api';
import { invoiceStatusOf, type Invoice } from '../types';
import { InvoiceView } from './invoice-view';

/** تاب "الحسابات" في ملف المريض (7.3): فواتيره ومدفوعاته، والصف بيفتح الفاتورة */
export function PatientBillingTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const invoices = useGetInvoicesQuery({ branch_id: 'all', days: 0, patient_id: patientId });
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  return (
    <Card>
      {invoices.isError ? (
        <ErrorState onRetry={() => void invoices.refetch()} />
      ) : (
        <Table<Invoice>
          rowKey="id"
          loading={invoices.isLoading}
          dataSource={invoices.data ?? []}
          pagination={false}
          scroll={{ x: 520 }}
          locale={{ emptyText: <EmptyState title={t('invoices.emptyPatient')} /> }}
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
              render: (_, invoice) => formatSlot(invoice.created_at, locale).day,
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
                  <StatusTag
                    tone={state === 'paid' ? 'success' : state === 'partial' ? 'warning' : 'danger'}
                  >
                    {t(`invoices.status.${state}`)}
                  </StatusTag>
                );
              },
            },
          ]}
        />
      )}
      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        destroyOnHidden
        size={480}
        title={selected?.number}
      >
        {selected && <InvoiceView invoice={selected} printable />}
      </Drawer>
    </Card>
  );
}
