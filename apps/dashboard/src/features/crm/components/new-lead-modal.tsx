import { useState } from 'react';
import { Alert, App, Form, Input, Modal, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { normalizeEgyptianMobile } from '@oxygen/shared';
import { SPECIALTIES } from '@oxygen/config';
import { apiErrorCode } from '@/lib/api-error';
import { useCreateLeadMutation, useGetCampaignsQuery } from '../crm.api';
import { LEAD_SOURCES, type LeadSource } from '../types';
import type { Specialty } from '@oxygen/config';

type Values = {
  name: string;
  phone: string;
  source: LeadSource;
  campaign_id: string | null;
  interest: Specialty | null;
  notes: string;
};

/** Lead جديد (D-20): الاسم والموبايل (بيمنع التكرار) والمصدر والحملة والاهتمام. بيبدأ من مرحلة Lead */
export function NewLeadModal({
  branchId,
  open,
  onClose,
}: {
  branchId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('crm');
  const { t: tCommon } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [duplicate, setDuplicate] = useState(false);
  const campaigns = useGetCampaignsQuery();
  const [create, { isLoading }] = useCreateLeadMutation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => {
        form.resetFields();
        setDuplicate(false);
      }}
      destroyOnHidden
      title={t('new.title')}
      okText={t('new.ok')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      {duplicate && (
        <Alert
          type="warning"
          showIcon
          role="alert"
          style={{ marginBottom: 12 }}
          title={t('errors.DUPLICATE_PHONE')}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ source: 'phone', campaign_id: null, interest: null, notes: '' }}
        onFinish={async (values) => {
          setDuplicate(false);
          const phone = normalizeEgyptianMobile(values.phone);
          if (!phone) return;
          try {
            await create({
              name: values.name,
              phone,
              branch_id: branchId,
              source: values.source,
              campaign_id: values.campaign_id,
              interest: values.interest,
              notes: values.notes ?? '',
            }).unwrap();
            void message.success(t('new.done'));
            onClose();
          } catch (error) {
            if (apiErrorCode(error as never) === 'DUPLICATE_PHONE') setDuplicate(true);
            else void message.error(t('errors.generic'));
          }
        }}
      >
        <Form.Item
          name="name"
          label={t('new.name')}
          rules={[{ required: true, whitespace: true, message: t('new.nameRequired') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label={t('new.phone')}
          extra={t('new.phoneHelp')}
          rules={[
            { required: true, message: t('new.phoneRequired') },
            {
              validator: (_, value: string) =>
                !value || normalizeEgyptianMobile(value)
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('new.phoneInvalid'))),
            },
          ]}
        >
          <Input dir="ltr" inputMode="tel" />
        </Form.Item>
        <Form.Item name="source" label={t('new.source')}>
          <Select
            options={LEAD_SOURCES.map((value) => ({ value, label: t(`sources.${value}`) }))}
          />
        </Form.Item>
        <Form.Item name="campaign_id" label={t('new.campaign')}>
          <Select
            allowClear
            placeholder={t('new.noCampaign')}
            options={(campaigns.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>
        <Form.Item name="interest" label={t('new.interest')}>
          <Select
            allowClear
            placeholder={t('new.noInterest')}
            options={SPECIALTIES.map((value) => ({
              value,
              label: tCommon(`specialties.${value}`),
            }))}
          />
        </Form.Item>
        <Form.Item name="notes" label={t('new.notes')}>
          <Input.TextArea rows={2} maxLength={300} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
