import { useState } from 'react';
import { Alert, App, DatePicker, Form, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatTime, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useCreateTimeBlockMutation } from '@/features/appointments/appointments.api';
import { calendarErrorKey, type CalendarErrorKey } from '@/features/appointments/errors';
import { DAY_END, SLOT_MIN, SLOTS, toHHmm } from '@/features/appointments/grid';
import {
  TIME_BLOCK_REASONS,
  type Practitioner,
  type TimeBlockReason,
} from '@/features/appointments/types';
import { clinicIso, clinicToday } from '@/lib/clinic-time';

type Values = {
  practitioner_id: string;
  date: Dayjs;
  from: number;
  to: number;
  reason: TimeBlockReason;
};

type Props = {
  open: { practitionerId?: string; date: string } | null;
  branchId: string;
  practitioners: Practitioner[];
  onClose: () => void;
};

/** قفل وقت في جدول دكتور (استراحة · اجتماع · إجازة) — مفيش حجز فيه */
export function BlockTimeModal({ open, branchId, practitioners, onClose }: Props) {
  const { t } = useTranslation('calendar');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [errorKey, setErrorKey] = useState<CalendarErrorKey | null>(null);
  const [create, { isLoading }] = useCreateTimeBlockMutation();
  const from = Form.useWatch('from', form);
  const today = clinicToday();

  const submit = async (values: Values) => {
    setErrorKey(null);
    const date = values.date.format('YYYY-MM-DD');
    try {
      await create({
        branch_id: branchId,
        practitioner_id: values.practitioner_id,
        starts_at: clinicIso(date, values.from),
        ends_at: clinicIso(date, values.to),
        reason: values.reason,
      }).unwrap();
      void message.success(t('block.done'));
      onClose();
    } catch (error) {
      setErrorKey(calendarErrorKey(error));
    }
  };

  const required = (field: string) => [
    { required: true, message: t('booking.required', { field }) },
  ];
  const timeOption = (minutes: number) => ({
    value: minutes,
    label: formatTime(toHHmm(minutes), locale),
  });

  return (
    <Modal
      open={!!open}
      title={t('block.title')}
      okText={t('block.submit')}
      cancelText={tCommon('actions.cancel')}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnHidden
      afterClose={() => {
        // المرة الجاية تبدأ من initialValues (P-33)
        form.resetFields();
        setErrorKey(null);
      }}
    >
      <Form<Values>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
        initialValues={
          open
            ? { practitioner_id: open.practitionerId, date: dayjs(open.date), reason: 'break' }
            : undefined
        }
      >
        <Form.Item
          name="practitioner_id"
          label={t('booking.practitioner')}
          rules={required(t('booking.practitioner'))}
        >
          <Select
            options={practitioners.map((item) => ({
              value: item.id,
              label: localized(item, 'name', locale),
            }))}
          />
        </Form.Item>
        <Form.Item name="date" label={t('booking.date')} rules={required(t('booking.date'))}>
          <DatePicker
            style={{ width: '100%' }}
            format="dddd D MMMM"
            allowClear={false}
            disabledDate={(day) => day.format('YYYY-MM-DD') < today}
          />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="from"
            label={t('block.from')}
            rules={required(t('block.from'))}
            style={{ flex: 1 }}
          >
            <Select options={SLOTS.map(timeOption)} />
          </Form.Item>
          <Form.Item
            name="to"
            label={t('block.to')}
            rules={required(t('block.to'))}
            style={{ flex: 1 }}
          >
            <Select
              options={[...SLOTS.slice(1), DAY_END]
                .filter((minutes) => from === undefined || minutes >= from + SLOT_MIN)
                .map(timeOption)}
            />
          </Form.Item>
        </div>
        <Form.Item name="reason" label={t('block.reason')}>
          <Select
            options={TIME_BLOCK_REASONS.map((value) => ({
              value,
              label: t(`block.reasons.${value}`),
            }))}
          />
        </Form.Item>
        {errorKey && <Alert type="error" showIcon role="alert" title={t(errorKey)} />}
      </Form>
    </Modal>
  );
}
