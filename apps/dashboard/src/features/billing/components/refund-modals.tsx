import { useEffect, useState } from 'react';
import { Alert, App, Form, Input, InputNumber, Modal, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { apiErrorCode } from '@/lib/api-error';
import { useDecideRefundMutation, useRequestRefundMutation } from '../refunds.api';
import type { Refund } from '../refunds-types';
import type { Invoice } from '../types';

/** طلب مرتجع على فاتورة (D-27): المبلغ (لحد المتاح) والسبب. المتاح = المدفوع ناقص المرتجعات المطلوبة قبل كده */
export function RequestRefundModal({
  invoice,
  refundable,
  open,
  onClose,
}: {
  invoice: Invoice;
  // بالقروش
  refundable: number;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<{ amount: number; reason: string }>();
  const [request, { isLoading }] = useRequestRefundMutation();
  useEffect(() => {
    if (open) form.setFieldsValue({ amount: refundable / 100, reason: '' });
  }, [open, refundable, form]);
  const money = (amount: number) => formatMoney(amount, 'EGP', locale);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnHidden
      title={t('refunds.request.title', { number: invoice.number })}
      okText={t('refunds.request.ok')}
      cancelText={t('refunds.cancel')}
      okButtonProps={{ disabled: refundable <= 0 }}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Typography.Paragraph type="secondary">
        {t('refunds.request.available', { amount: money(refundable) })}
      </Typography.Paragraph>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ amount: refundable / 100, reason: '' }}
        onFinish={async (values) => {
          try {
            await request({
              invoice_id: invoice.id,
              amount: Math.round(values.amount * 100),
              reason: values.reason,
            }).unwrap();
            void message.success(t('refunds.request.done'));
            onClose();
          } catch (error) {
            const code = apiErrorCode(error as never);
            void message.error(
              code === 'REFUND_TOO_HIGH'
                ? t('refunds.errors.tooHigh')
                : t('refunds.errors.generic'),
            );
          }
        }}
      >
        <Form.Item
          name="amount"
          label={t('refunds.request.amount')}
          rules={[
            {
              validator: (_, value: number) =>
                value > 0 && value * 100 <= refundable
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('refunds.errors.tooHigh'))),
            },
          ]}
        >
          <InputNumber min={0} suffix={t('refunds.currency')} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="reason"
          label={t('refunds.request.reason')}
          rules={[
            { required: true, whitespace: true, message: t('refunds.request.reasonRequired') },
          ]}
        >
          <Input.TextArea rows={3} maxLength={300} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/** قرار على طلب مرتجع (D-27): موافقة (ملاحظة اختيارية) أو رفض (السبب إجباري) */
export function DecideRefundModal({
  refund,
  approve,
  onClose,
}: {
  refund: Refund | null;
  approve: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('billing');
  const locale = useLocale();
  const { message } = App.useApp();
  const [note, setNote] = useState('');
  const [taken, setTaken] = useState(false);
  const [decide, { isLoading }] = useDecideRefundMutation();

  return (
    <Modal
      open={refund !== null}
      onCancel={onClose}
      destroyOnHidden
      afterClose={() => {
        setNote('');
        setTaken(false);
      }}
      title={t(approve ? 'refunds.decide.approveTitle' : 'refunds.decide.rejectTitle')}
      okText={t(approve ? 'refunds.decide.approve' : 'refunds.decide.reject')}
      cancelText={t('refunds.cancel')}
      okButtonProps={{ danger: !approve, disabled: !approve && !note.trim() }}
      confirmLoading={isLoading}
      onOk={async () => {
        if (!refund) return;
        try {
          await decide({ id: refund.id, approve, note }).unwrap();
          void message.success(t(approve ? 'refunds.decide.approved' : 'refunds.decide.rejected'));
          onClose();
        } catch (error) {
          if (apiErrorCode(error as never) === 'ALREADY_DECIDED') setTaken(true);
          else void message.error(t('refunds.errors.generic'));
        }
      }}
    >
      {refund && (
        <>
          <Typography.Paragraph>
            {t('refunds.decide.summary', {
              patient: localized(refund.patient, 'name', locale),
              amount: formatMoney(refund.amount, 'EGP', locale),
              number: refund.invoice_number,
            })}
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">{refund.reason}</Typography.Paragraph>
          {taken && (
            <Alert
              type="warning"
              showIcon
              role="alert"
              style={{ marginBottom: 12 }}
              title={t('refunds.errors.alreadyDecided')}
            />
          )}
          <Input.TextArea
            rows={3}
            maxLength={300}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            aria-label={t(approve ? 'refunds.decide.noteOptional' : 'refunds.decide.noteRequired')}
            placeholder={t(approve ? 'refunds.decide.noteOptional' : 'refunds.decide.noteRequired')}
          />
        </>
      )}
    </Modal>
  );
}
