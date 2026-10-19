import { Descriptions, Divider, Flex, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import type { Invoice } from '../types';

/**
 * الفاتورة نفسها: بتظهر بعد التحصيل، وهي اللي بتتطبع (window.print) —
 * global.css بيخبّي كل الصفحة وقت الطباعة ما عدا `.print-area`.
 */
export function InvoiceView({
  invoice,
  printable = false,
}: {
  invoice: Invoice;
  printable?: boolean;
}) {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const { branches } = useBranchScope();
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);
  const branch = branches.find((item) => item.id === invoice.branch_id);
  const issued = formatSlot(invoice.created_at, locale);

  return (
    <div className={printable ? 'print-area' : undefined} style={{ textAlign: 'start' }}>
      <Flex justify="space-between" align="center" gap={16} wrap>
        <img src="/logo.png" alt="Oxygen" width={72} height={66} />
        <div>
          <Typography.Title level={2} style={{ margin: 0, fontSize: 20 }}>
            {t('invoice.title')} <span dir="ltr">{invoice.number}</span>
          </Typography.Title>
          <Typography.Text type="secondary">
            {branch ? localized(branch, 'name', locale) : ''} · {issued.day} {issued.time}
          </Typography.Text>
        </div>
      </Flex>
      <Divider style={{ margin: '16px 0' }} />
      <Descriptions
        size="small"
        column={2}
        items={[
          {
            key: 'patient',
            label: t('invoice.patient'),
            children: (
              <>
                {localized(invoice.patient, 'name', locale)} ·{' '}
                <span dir="ltr">{invoice.patient.file_no}</span>
              </>
            ),
          },
          {
            key: 'cashier',
            label: t('invoice.cashier'),
            children: locale === 'ar' ? invoice.cashier_name_ar : invoice.cashier_name_en,
          },
        ]}
      />
      <Table
        size="small"
        rowKey="item_id"
        pagination={false}
        style={{ marginTop: 12 }}
        dataSource={invoice.lines}
        columns={[
          {
            key: 'item',
            title: t('pos.item'),
            render: (_, line) => localized(line, 'name', locale),
          },
          { key: 'qty', title: t('pos.qty'), dataIndex: 'qty', width: 70 },
          { key: 'price', title: t('pos.price'), render: (_, line) => money(line.unit_price) },
          { key: 'total', title: t('pos.lineTotal'), render: (_, line) => money(line.total) },
        ]}
      />
      <Flex vertical gap={4} style={{ marginTop: 16, maxWidth: 320, marginInlineStart: 'auto' }}>
        {[
          [t('pos.subtotal'), money(invoice.subtotal)],
          ...(invoice.discount > 0
            ? [[t('pos.discountTotal'), `− ${money(invoice.discount)}`]]
            : []),
          ...(invoice.previous_balance > 0
            ? [[t('pos.carried'), money(invoice.previous_balance)]]
            : []),
          [t('pos.total'), money(invoice.total)],
          [`${t('invoice.paid')} (${t(`pos.methods.${invoice.method}`)})`, money(invoice.paid)],
          ...(invoice.balance_after > 0
            ? [[t('invoice.balanceAfter'), money(invoice.balance_after)]]
            : []),
        ].map(([label, value]) => (
          <Flex key={label} justify="space-between" gap={16}>
            <Typography.Text type="secondary">{label}</Typography.Text>
            <Typography.Text strong>{value}</Typography.Text>
          </Flex>
        ))}
      </Flex>
      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 24, marginBottom: 0, textAlign: 'center' }}
      >
        {t('invoice.thanks')} · Oxygen
      </Typography.Paragraph>
    </div>
  );
}
