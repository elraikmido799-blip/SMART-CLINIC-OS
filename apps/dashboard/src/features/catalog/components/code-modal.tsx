import { Alert, App, DatePicker, Form, Input, InputNumber, Modal, Radio, Switch } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiErrorCode } from '@/lib/api-error';
import { clinicToday } from '@/lib/clinic-time';
import { useCreateDiscountCodeMutation, useUpdateDiscountCodeMutation } from '../codes.api';
import {
  CODE_APPLIES_TO,
  CODE_TYPES,
  type DiscountCode,
  type DiscountCodeBody,
} from '../codes-types';

type Values = {
  code: string;
  type: DiscountCodeBody['type'];
  // نسبة، أو جنيه لو مبلغ ثابت
  value: number;
  period: [Dayjs, Dayjs | null];
  max_uses: number | null;
  applies_to: DiscountCodeBody['applies_to'];
  active: boolean;
};

const toValues = (code: DiscountCode | null): Values => ({
  code: code?.code ?? '',
  type: code?.type ?? 'percent',
  value: code ? (code.type === 'fixed' ? code.value / 100 : code.value) : 10,
  period: [dayjs(code?.starts_on ?? clinicToday()), code?.ends_on ? dayjs(code.ends_on) : null],
  max_uses: code?.max_uses ?? null,
  applies_to: code?.applies_to ?? 'all',
  active: code?.active ?? true,
});

/** كود خصم جديد أو تعديل كود (D-25). الكود حروف إنجليزي وأرقام، ومينفعش يتكرر */
export function CodeModal({
  code,
  open,
  onClose,
}: {
  // فاضي = كود جديد
  code: DiscountCode | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('catalog');
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [duplicate, setDuplicate] = useState(false);
  const [create, createState] = useCreateDiscountCodeMutation();
  const [update, updateState] = useUpdateDiscountCodeMutation();
  const type = Form.useWatch('type', form) ?? code?.type ?? 'percent';

  const save = async (values: Values) => {
    setDuplicate(false);
    const body: DiscountCodeBody = {
      code: values.code,
      type: values.type,
      value: values.type === 'fixed' ? Math.round(values.value * 100) : values.value,
      starts_on: values.period[0].format('YYYY-MM-DD'),
      ends_on: values.period[1] ? values.period[1].format('YYYY-MM-DD') : null,
      max_uses: values.max_uses,
      applies_to: values.applies_to,
      active: values.active,
    };
    try {
      if (code) await update({ id: code.id, ...body }).unwrap();
      else await create(body).unwrap();
      void message.success(t(code ? 'codes.saved' : 'codes.created'));
      onClose();
    } catch (error) {
      if (apiErrorCode(error as never) === 'DUPLICATE_CODE') setDuplicate(true);
      else void message.error(t('errors.generic'));
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnHidden
      afterClose={() => setDuplicate(false)}
      title={t(code ? 'codes.edit' : 'codes.new')}
      okText={t('drawer.save')}
      cancelText={t('cancel')}
      confirmLoading={createState.isLoading || updateState.isLoading}
      onOk={() => form.submit()}
    >
      {duplicate && (
        <Alert
          type="warning"
          showIcon
          role="alert"
          style={{ marginBottom: 12 }}
          title={t('codes.duplicate')}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={toValues(code)}
        onFinish={save}
      >
        <Form.Item
          name="code"
          label={t('codes.code')}
          normalize={(value: string) => value.toUpperCase()}
          rules={[
            {
              pattern: /^[A-Za-z0-9]{3,20}$/,
              message: t('codes.codeInvalid'),
            },
          ]}
        >
          <Input dir="ltr" maxLength={20} />
        </Form.Item>
        <Form.Item name="type" label={t('codes.type')}>
          <Radio.Group
            optionType="button"
            options={CODE_TYPES.map((value) => ({ value, label: t(`codes.types.${value}`) }))}
          />
        </Form.Item>
        <Form.Item
          name="value"
          label={t(type === 'percent' ? 'codes.valuePercent' : 'codes.valueAmount')}
          rules={[
            {
              validator: (_, value: number) =>
                value > 0 && (type === 'fixed' || value <= 100)
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('codes.valueInvalid'))),
            },
          ]}
        >
          <InputNumber
            min={0}
            max={type === 'percent' ? 100 : undefined}
            suffix={type === 'percent' ? '%' : t('fields.currency')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name="period"
          label={t('codes.period')}
          rules={[{ required: true, message: t('codes.periodRequired') }]}
        >
          <DatePicker.RangePicker
            allowEmpty={[false, true]}
            placeholder={[t('codes.from'), t('codes.noEnd')]}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item name="max_uses" label={t('codes.maxUses')} extra={t('codes.maxUsesHelp')}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="applies_to" label={t('codes.appliesTo')}>
          <Radio.Group
            optionType="button"
            options={CODE_APPLIES_TO.map((value) => ({
              value,
              label: t(`codes.applies.${value}`),
            }))}
          />
        </Form.Item>
        <Form.Item name="active" label={t('fields.active')} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
