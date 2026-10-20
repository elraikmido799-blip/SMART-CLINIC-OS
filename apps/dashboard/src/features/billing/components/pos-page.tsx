import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Input,
  InputNumber,
  Result,
  Row,
  Segmented,
  Select,
  Table,
  Typography,
} from 'antd';
import { Printer, Trash2 } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatMoney, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useSearchPatientsQuery } from '@/features/appointments/appointments.api';
import type { PatientSummary } from '@/features/appointments/types';
import { useMe } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { FrontDeskTabs } from '@/features/front-desk/components/front-desk-tabs';
import { useGetPatientQuery } from '@/features/patients/patients.api';
import { apiErrorCode } from '@/lib/api-error';
import { useDebounced } from '@/lib/use-debounced';
import { ALL_BRANCHES } from '@/store/ui-slice';
import {
  useCheckDiscountCodeMutation,
  useCreateInvoiceMutation,
  useGetSellablesQuery,
} from '../billing.api';
import { invoiceTotals } from '../totals';
import {
  PAYMENT_METHODS,
  type CodeResult,
  type Discount,
  type Invoice,
  type PaymentMethod,
  type Sellable,
} from '../types';
import { InvoiceView } from './invoice-view';

type Line = { item: Sellable; qty: number };

// الكود ممكن يتطبق على الخدمات بس أو الباقات بس
const codeBase = (lines: Line[], code: CodeResult | null) =>
  lines
    .filter((line) => !code || code.applies_to === 'all' || line.item.kind === code.applies_to)
    .reduce((sum, line) => sum + line.item.price * line.qty, 0);
const KNOWN_ERRORS = [
  'DISCOUNT_TOO_HIGH',
  'INVALID_CODE',
  'INVALID_AMOUNT',
  'EMPTY',
  'FORBIDDEN',
] as const;
type ErrorKey = `errors.${(typeof KNOWN_ERRORS)[number] | 'generic'}`;

const errorKeyOf = (error: unknown): ErrorKey => {
  const code = apiErrorCode(error as never) ?? '';
  return (KNOWN_ERRORS as readonly string[]).includes(code)
    ? (`errors.${code}` as ErrorKey)
    : 'errors.generic';
};

// الجنيه ↔ القروش (الـAPI بالقروش، والموظف بيكتب جنيهات)
const toMinor = (pounds: number) => Math.round(pounds * 100);
const toPounds = (minor: number) => minor / 100;

/**
 * التحصيل (D-06 · docs/20 · 3.6): المريض · الخدمات والباقات · الفلوس المتأخرة · خصم يدوي (لحد الموظف) أو كود ·
 * طريقة الدفع · المدفوع (الباقي للمريض أو اللي هيتسجل عليه) ← فاتورة للطباعة.
 * من الطابور أو "واصلين دلوقتي": ?patient=&appointment=&service= بيجهّزوا الفاتورة.
 */
export function PosPage() {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const me = useMe();
  const { message } = App.useApp();
  const navigate = useNavigate({ from: '/front-desk/pos' });
  const search = useSearch({ from: '/_app/front-desk/pos' });
  const { branchId, branches } = useBranchScope();
  const sellables = useGetSellablesQuery();
  const preset = useGetPatientQuery(search.patient ?? '', { skip: !search.patient });
  const [checkCode, codeState] = useCheckDiscountCodeMutation();
  const [createInvoice, invoiceState] = useCreateInvoiceMutation();

  const [chosenPatient, setPatient] = useState<PatientSummary | null>(null);
  // null = لسه محدش عدّل البنود (ساعتها خدمة الميعاد هي البند الأول)
  const [editedLines, setEditedLines] = useState<Line[] | null>(null);
  const [includeBalance, setIncludeBalance] = useState(true);
  const [discount, setDiscount] = useState<Discount>({ type: 'percent', value: 0 });
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<CodeResult | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paidPounds, setPaidPounds] = useState<number | null>(null);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [query, setQuery] = useState('');
  const patientSearch = useDebounced(query.trim());
  const results = useSearchPatientsQuery(
    { q: patientSearch },
    { skip: patientSearch.length < 2, refetchOnMountOrArgChange: true },
  );

  // جاي من ميعاد: المريض وخدمة الميعاد جاهزين (محسوبين، مش متنسخين في الـstate)
  const patient = chosenPatient ?? (search.patient ? preset.data : undefined) ?? null;
  const presetService = sellables.data?.find((item) => item.id === search.service);
  const lines = editedLines ?? (presetService ? [{ item: presetService, qty: 1 }] : []);
  const setLines = (update: (current: Line[]) => Line[]) => setEditedLines(update(lines));

  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const manual: Discount | null =
    discount.value > 0
      ? {
          type: discount.type,
          value: discount.type === 'amount' ? toMinor(discount.value) : discount.value,
        }
      : null;
  const balance = patient?.balance_due ?? 0;
  const totals = invoiceTotals({
    subtotal,
    discount: manual,
    codePercent: code?.percent ?? 0,
    codeAmount: code?.amount ?? 0,
    codeBase: codeBase(lines, code),
    previousBalance: balance,
    includeBalance: includeBalance && balance > 0,
  });
  const paid = paidPounds === null ? totals.total : toMinor(paidPounds);
  const change = method === 'cash' && paid > totals.total ? paid - totals.total : 0;
  const remaining = Math.max(0, totals.total - paid);
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);
  const canDiscount = me.max_discount_percent > 0;
  const scoped = branchId !== ALL_BRANCHES;

  const reset = () => {
    setInvoice(null);
    setPatient(null);
    setEditedLines(null);
    setDiscount({ type: 'percent', value: 0 });
    setCode(null);
    setCodeInput('');
    setPaidPounds(null);
    setErrorKey(null);
    void navigate({ search: {} });
  };

  const submit = async () => {
    if (!patient) return;
    setErrorKey(null);
    try {
      const created = await createInvoice({
        branch_id: scoped ? branchId : (branches[0]?.id ?? ''),
        patient_id: patient.id,
        appointment_id: search.appointment ?? null,
        items: lines.map((line) => ({
          item_id: line.item.id,
          kind: line.item.kind,
          qty: line.qty,
        })),
        include_balance: includeBalance && balance > 0,
        discount: manual,
        code: code?.code ?? null,
        // الكاش اللي زيادة بيرجع للمريض، فالمتسجل هو المطلوب بس
        payment: { method, amount: Math.min(paid, totals.total) },
      }).unwrap();
      setInvoice(created);
      void message.success(t('pos.done', { amount: money(created.paid), number: created.number }));
    } catch (error) {
      setErrorKey(errorKeyOf(error));
    }
  };

  const applyCode = async () => {
    try {
      setCode(await checkCode({ code: codeInput }).unwrap());
      setErrorKey(null);
    } catch (error) {
      setErrorKey(errorKeyOf(error));
    }
  };

  const header = (
    <>
      <PageHeader title={t('pos.title')} description={t('pos.description')} />
      <FrontDeskTabs />
    </>
  );

  if (invoice) {
    return (
      <>
        {header}
        <Card>
          <Result
            status="success"
            title={t('pos.successTitle')}
            subTitle={t('pos.done', { amount: money(invoice.paid), number: invoice.number })}
            extra={[
              <Button
                key="print"
                type="primary"
                icon={<Printer size={16} aria-hidden />}
                onClick={() => window.print()}
              >
                {t('pos.print')}
              </Button>,
              <Button key="new" onClick={reset}>
                {t('pos.newInvoice')}
              </Button>,
            ]}
          />
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <InvoiceView invoice={invoice} printable />
          </div>
        </Card>
      </>
    );
  }

  const services = (sellables.data ?? []).filter((item) => item.kind === 'service');
  const packages = (sellables.data ?? []).filter((item) => item.kind === 'package');
  const itemLabel = (item: Sellable) =>
    `${localized(item, 'name', locale)} — ${money(item.price)}${item.sessions ? ` · ${t('pos.sessions', { count: item.sessions })}` : ''}`;

  return (
    <>
      {header}
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={15}>
          <Flex vertical gap={24}>
            <Card title={t('pos.patient')}>
              <Select
                showSearch={{ filterOption: false, onSearch: setQuery }}
                aria-label={t('pos.patient')}
                placeholder={t('pos.patientPlaceholder')}
                style={{ width: '100%' }}
                size="large"
                value={patient?.id}
                loading={results.isFetching}
                onChange={(id) => {
                  const found = [...(results.data ?? []), ...(patient ? [patient] : [])].find(
                    (item) => item.id === id,
                  );
                  if (found) setPatient(found);
                }}
                options={[...(patient ? [patient] : []), ...(results.data ?? [])]
                  .filter(
                    (item, index, list) =>
                      list.findIndex((entry) => entry.id === item.id) === index,
                  )
                  .map((item) => ({
                    value: item.id,
                    label: `${localized(item, 'name', locale)} · ${item.file_no} · ${formatEgyptianMobile(item.phone)}`,
                  }))}
              />
              {search.appointment && patient && (
                <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  {t('pos.fromAppointment')}
                </Typography.Text>
              )}
              {balance > 0 && (
                <Checkbox
                  checked={includeBalance}
                  onChange={(event) => setIncludeBalance(event.target.checked)}
                  style={{ marginTop: 12 }}
                >
                  {t('pos.includeBalance', { amount: money(balance) })}
                </Checkbox>
              )}
            </Card>

            <Card title={t('pos.items')}>
              <Select
                aria-label={t('pos.addItem')}
                placeholder={t('pos.addItem')}
                style={{ width: '100%', marginBottom: 16 }}
                value={null}
                showSearch={{
                  filterOption: (input, option) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                }}
                onChange={(id) => {
                  const item = sellables.data?.find((entry) => entry.id === id);
                  if (!item) return;
                  setLines((current) =>
                    current.some((line) => line.item.id === id)
                      ? current.map((line) =>
                          line.item.id === id ? { ...line, qty: line.qty + 1 } : line,
                        )
                      : [...current, { item, qty: 1 }],
                  );
                }}
                options={[
                  {
                    label: t('pos.services'),
                    options: services.map((item) => ({ value: item.id, label: itemLabel(item) })),
                  },
                  {
                    label: t('pos.packages'),
                    options: packages.map((item) => ({ value: item.id, label: itemLabel(item) })),
                  },
                ]}
              />
              <Table<Line>
                rowKey={(line) => line.item.id}
                pagination={false}
                dataSource={lines}
                locale={{ emptyText: <EmptyState title={t('pos.emptyItems')} /> }}
                scroll={{ x: 'max-content' }}
                columns={[
                  {
                    key: 'item',
                    title: t('pos.item'),
                    render: (_, line) => (
                      <Flex vertical>
                        {localized(line.item, 'name', locale)}
                        {line.item.sessions && (
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {t('pos.sessions', { count: line.item.sessions })}
                          </Typography.Text>
                        )}
                      </Flex>
                    ),
                  },
                  {
                    key: 'qty',
                    title: t('pos.qty'),
                    width: 100,
                    render: (_, line) => (
                      <InputNumber
                        aria-label={t('pos.qty')}
                        min={1}
                        max={20}
                        value={line.qty}
                        onChange={(value) =>
                          setLines((current) =>
                            current.map((entry) =>
                              entry.item.id === line.item.id
                                ? { ...entry, qty: value ?? 1 }
                                : entry,
                            ),
                          )
                        }
                        style={{ width: 72 }}
                      />
                    ),
                  },
                  {
                    key: 'price',
                    title: t('pos.price'),
                    render: (_, line) => money(line.item.price),
                  },
                  {
                    key: 'total',
                    title: t('pos.lineTotal'),
                    render: (_, line) => money(line.item.price * line.qty),
                  },
                  {
                    key: 'remove',
                    width: 56,
                    // عنوان للقارئ بس (العمود فيه زرار حذف من غير نص)
                    title: <span className="sr-only">{t('pos.removeColumn')}</span>,
                    render: (_, line) => (
                      <Button
                        type="text"
                        aria-label={t('pos.remove', { name: localized(line.item, 'name', locale) })}
                        icon={<Trash2 size={16} aria-hidden />}
                        onClick={() =>
                          setLines((current) =>
                            current.filter((entry) => entry.item.id !== line.item.id),
                          )
                        }
                      />
                    ),
                  },
                ]}
              />

              <Divider />
              <Flex wrap gap={24}>
                {canDiscount && (
                  <Flex vertical gap={6} style={{ flex: '1 1 240px' }}>
                    <Typography.Text strong>{t('pos.discount')}</Typography.Text>
                    <Flex gap={8}>
                      <Segmented<Discount['type']>
                        value={discount.type}
                        onChange={(type) => setDiscount({ type, value: 0 })}
                        options={[
                          { value: 'percent', label: t('pos.percent') },
                          { value: 'amount', label: t('pos.amount') },
                        ]}
                      />
                      <InputNumber
                        aria-label={t('pos.discount')}
                        min={0}
                        max={
                          discount.type === 'percent' ? me.max_discount_percent : toPounds(subtotal)
                        }
                        value={discount.value}
                        onChange={(value) =>
                          setDiscount((current) => ({ ...current, value: value ?? 0 }))
                        }
                        suffix={discount.type === 'percent' ? '%' : undefined}
                        style={{ width: 120 }}
                      />
                    </Flex>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {t('pos.maxDiscount', { max: me.max_discount_percent })}
                    </Typography.Text>
                  </Flex>
                )}
                <Flex vertical gap={6} style={{ flex: '1 1 240px' }}>
                  <Typography.Text strong>{t('pos.code')}</Typography.Text>
                  {code ? (
                    <Flex gap={8} align="center" wrap>
                      <StatusTag tone="success">
                        {code.amount > 0
                          ? t('pos.codeAppliedAmount', {
                              code: code.code,
                              amount: money(code.amount),
                            })
                          : t('pos.codeApplied', code)}
                      </StatusTag>
                      <Button
                        type="link"
                        onClick={() => setCode(null)}
                        style={{ paddingInline: 0 }}
                      >
                        {t('pos.removeCode')}
                      </Button>
                    </Flex>
                  ) : (
                    <Flex gap={8}>
                      <Input
                        aria-label={t('pos.code')}
                        dir="ltr"
                        value={codeInput}
                        onChange={(event) => setCodeInput(event.target.value)}
                        onPressEnter={applyCode}
                        style={{ maxWidth: 180 }}
                      />
                      <Button
                        onClick={applyCode}
                        loading={codeState.isLoading}
                        disabled={!codeInput.trim()}
                      >
                        {t('pos.applyCode')}
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Col>

        <Col xs={24} xl={9}>
          <Card title={t('pos.summary')} style={{ position: 'sticky', top: 88 }}>
            <Flex vertical gap={8}>
              {[
                [t('pos.subtotal'), money(subtotal)],
                ...(totals.discount > 0
                  ? [[t('pos.discountTotal'), `− ${money(totals.discount)}`]]
                  : []),
                ...(includeBalance && balance > 0 ? [[t('pos.carried'), money(balance)]] : []),
              ].map(([label, value]) => (
                <Flex key={label} justify="space-between">
                  <Typography.Text type="secondary">{label}</Typography.Text>
                  <Typography.Text>{value}</Typography.Text>
                </Flex>
              ))}
              <Divider style={{ margin: '4px 0' }} />
              <Flex justify="space-between" align="baseline">
                <Typography.Text strong>{t('pos.total')}</Typography.Text>
                <Typography.Text strong style={{ fontSize: 24 }}>
                  {money(totals.total)}
                </Typography.Text>
              </Flex>

              <Typography.Text strong style={{ marginTop: 12 }}>
                {t('pos.method')}
              </Typography.Text>
              <Segmented
                block
                value={method}
                onChange={setMethod}
                options={PAYMENT_METHODS.map((value) => ({
                  value,
                  label: t(`pos.methods.${value}`),
                }))}
              />
              <Typography.Text strong style={{ marginTop: 12 }}>
                {t('pos.paid')}
              </Typography.Text>
              <InputNumber
                aria-label={t('pos.paid')}
                size="large"
                min={0}
                step={50}
                value={toPounds(paid)}
                onChange={(value) => setPaidPounds(value)}
                style={{ width: '100%' }}
              />
              {change > 0 && (
                <StatusTag tone="info">
                  {t('pos.change')}: {money(change)}
                </StatusTag>
              )}
              {remaining > 0 && (
                <StatusTag tone="warning">
                  {t('pos.remaining')}: {money(remaining)}
                </StatusTag>
              )}
              {errorKey && (
                <Alert
                  type="error"
                  showIcon
                  role="alert"
                  title={t(errorKey)}
                  style={{ marginTop: 8 }}
                />
              )}
              <Button
                type="primary"
                size="large"
                block
                style={{ marginTop: 12 }}
                loading={invoiceState.isLoading}
                disabled={!patient || (lines.length === 0 && !(includeBalance && balance > 0))}
                onClick={submit}
              >
                {t('pos.submit')}
              </Button>
              {!patient && (
                <Typography.Text type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
                  {t('pos.pickPatient')}
                </Typography.Text>
              )}
            </Flex>
          </Card>
        </Col>
      </Row>
    </>
  );
}
