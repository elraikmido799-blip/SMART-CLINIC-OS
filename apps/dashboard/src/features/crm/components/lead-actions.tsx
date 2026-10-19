import { useState } from 'react';
import { Alert, App, Form, Input, Modal, Radio, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { apiErrorCode } from '@/lib/api-error';
import {
  useConvertLeadMutation,
  useGetWhatsappTemplatesQuery,
  useLogLeadCallMutation,
  useMarkLeadLostMutation,
  useSendLeadWhatsappMutation,
} from '../crm.api';
import {
  CALL_OUTCOMES,
  LOST_REASONS,
  type CallOutcome,
  type Lead,
  type LostReason,
} from '../types';

type Props = { lead: Lead; open: boolean; onClose: () => void };

/** سجّل مكالمة (D-21): النتيجة وملاحظة. أول تواصل بيسجّل وقت الـSLA وبينقل الـLead لـ"اتكلّمنا معاه" */
export function LogCallModal({ lead, open, onClose }: Props) {
  const { t } = useTranslation('crm');
  const { message } = App.useApp();
  const [outcome, setOutcome] = useState<CallOutcome>('interested');
  const [notes, setNotes] = useState('');
  const [log, { isLoading }] = useLogLeadCallMutation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => {
        setOutcome('interested');
        setNotes('');
      }}
      destroyOnHidden
      title={t('call.title')}
      okText={t('call.ok')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={async () => {
        try {
          await log({ id: lead.id, outcome, notes }).unwrap();
          void message.success(t('call.done'));
          onClose();
        } catch {
          void message.error(t('errors.generic'));
        }
      }}
    >
      <Form layout="vertical" component="div">
        <Form.Item label={t('call.outcome')}>
          <Radio.Group value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            <div style={{ display: 'grid', gap: 6 }}>
              {CALL_OUTCOMES.map((value) => (
                <Radio key={value} value={value}>
                  {t(`outcomes.${value}`)}
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={t('call.notes')}>
          <Input.TextArea
            aria-label={t('call.notes')}
            rows={3}
            maxLength={300}
            showCount
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/** ابعت واتساب من قالب معتمد (مفيش رسالة حرة) — الباك هو اللي بيبعت، والفرونت بيختار القالب */
export function WhatsappModal({ lead, open, onClose }: Props) {
  const { t } = useTranslation('crm');
  const { message } = App.useApp();
  const [templateId, setTemplateId] = useState<string>();
  const templates = useGetWhatsappTemplatesQuery(undefined, { skip: !open });
  const [send, { isLoading }] = useSendLeadWhatsappMutation();
  const chosen = templates.data?.find((item) => item.id === templateId);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => setTemplateId(undefined)}
      destroyOnHidden
      title={t('whatsapp.title')}
      okText={t('whatsapp.ok')}
      cancelText={t('cancel')}
      okButtonProps={{ disabled: !templateId }}
      confirmLoading={isLoading}
      onOk={async () => {
        if (!templateId) return;
        try {
          await send({ id: lead.id, template_id: templateId }).unwrap();
          void message.success(t('whatsapp.done'));
          onClose();
        } catch {
          void message.error(t('errors.generic'));
        }
      }}
    >
      <Form layout="vertical" component="div">
        <Form.Item label={t('whatsapp.template')} extra={t('whatsapp.hint')}>
          <Select
            aria-label={t('whatsapp.template')}
            loading={templates.isLoading}
            value={templateId}
            onChange={setTemplateId}
            options={(templates.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
          />
        </Form.Item>
      </Form>
      {chosen && (
        <Typography.Paragraph type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
          <bdi>{chosen.body_ar}</bdi>
        </Typography.Paragraph>
      )}
    </Modal>
  );
}

/** خسرناه (D-21): بسبب إجباري. الـLead بيخرج من اللوحة وبيفضل في التاريخ */
export function LostModal({ lead, open, onClose }: Props) {
  const { t } = useTranslation('crm');
  const { message } = App.useApp();
  const [reason, setReason] = useState<LostReason>();
  const [notes, setNotes] = useState('');
  const [lose, { isLoading }] = useMarkLeadLostMutation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => {
        setReason(undefined);
        setNotes('');
      }}
      destroyOnHidden
      title={t('lost.title', { name: lead.name })}
      okText={t('lost.ok')}
      cancelText={t('cancel')}
      okButtonProps={{ danger: true, disabled: !reason }}
      confirmLoading={isLoading}
      onOk={async () => {
        if (!reason) return;
        try {
          await lose({ id: lead.id, reason, notes }).unwrap();
          void message.success(t('lost.done'));
          onClose();
        } catch {
          void message.error(t('errors.generic'));
        }
      }}
    >
      <Form layout="vertical" component="div">
        <Form.Item label={t('lost.reason')} required>
          <Select
            aria-label={t('lost.reason')}
            placeholder={t('lost.reasonPlaceholder')}
            value={reason}
            onChange={setReason}
            options={LOST_REASONS.map((value) => ({ value, label: t(`lostReasons.${value}`) }))}
          />
        </Form.Item>
        <Form.Item label={t('lost.notes')}>
          <Input.TextArea
            aria-label={t('lost.notes')}
            rows={2}
            maxLength={300}
            showCount
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

/** حوّله لمريض: بيعمل ملف مريض من بيانات الـLead (النوع بس اللي بيتسأل عليه) وبعدها الحجز بيبقى عليه */
export function ConvertModal({ lead, open, onClose }: Props) {
  const { t } = useTranslation('crm');
  const { message } = App.useApp();
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [duplicate, setDuplicate] = useState(false);
  const [convert, { isLoading }] = useConvertLeadMutation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => setDuplicate(false)}
      destroyOnHidden
      title={t('convert.title', { name: lead.name })}
      okText={t('convert.ok')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={async () => {
        setDuplicate(false);
        try {
          await convert({ id: lead.id, gender }).unwrap();
          void message.success(t('convert.done'));
          onClose();
        } catch (error) {
          if (apiErrorCode(error as never) === 'DUPLICATE_PHONE') setDuplicate(true);
          else void message.error(t('errors.generic'));
        }
      }}
    >
      {duplicate && (
        <Alert
          type="warning"
          showIcon
          role="alert"
          style={{ marginBottom: 12 }}
          title={t('convert.duplicate')}
        />
      )}
      <Typography.Paragraph>{t('convert.body')}</Typography.Paragraph>
      <Form layout="vertical" component="div">
        <Form.Item label={t('convert.gender')}>
          <Radio.Group value={gender} onChange={(event) => setGender(event.target.value)}>
            <Radio value="female">{t('convert.female')}</Radio>
            <Radio value="male">{t('convert.male')}</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
