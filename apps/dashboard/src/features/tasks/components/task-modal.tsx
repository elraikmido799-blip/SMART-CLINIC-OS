import { App, DatePicker, Form, Input, Modal, Radio, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useCan } from '@/features/auth/use-me';
import { useGetCrmAgentsQuery } from '@/features/crm/crm.api';
import { clinicToday } from '@/lib/clinic-time';
import { useCreateTaskMutation } from '../tasks.api';
import { TASK_PRIORITIES, type TaskPriority, type TaskRelatedType } from '../types';

type Values = {
  title: string;
  due: Dayjs;
  priority: TaskPriority;
  assignee_id: string | null;
  notes: string;
};

type Props = {
  branchId: string;
  // مهمة على عميل أو مريض معيّن (من الـDrawer أو ملف المريض). من غيرها = مهمة عامة
  related?: { type: TaskRelatedType; id: string };
  open: boolean;
  onClose: () => void;
};

/** مهمة جديدة (D-22): العنوان واليوم والأولوية والمسؤول (الافتراضي أنا). مين يعيّن لغيره = اللي يشوف الـAgents */
export function NewTaskModal({ branchId, related, open, onClose }: Props) {
  const { t } = useTranslation('tasks');
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const canAssign = useCan('leads.read');
  const agents = useGetCrmAgentsQuery(undefined, { skip: !canAssign });
  const [create, { isLoading }] = useCreateTaskMutation();
  const today = clinicToday();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => form.resetFields()}
      destroyOnHidden
      title={t('new.title')}
      okText={t('new.ok')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ priority: 'normal', assignee_id: null, notes: '' }}
        onFinish={async (values) => {
          try {
            await create({
              title: values.title,
              notes: values.notes ?? '',
              due_on: values.due.format('YYYY-MM-DD'),
              priority: values.priority,
              branch_id: branchId,
              assignee_id: values.assignee_id,
              related: related ?? null,
            }).unwrap();
            void message.success(t('new.done'));
            onClose();
          } catch {
            void message.error(t('errors.generic'));
          }
        }}
      >
        <Form.Item
          name="title"
          label={t('new.name')}
          rules={[{ required: true, whitespace: true, message: t('new.nameRequired') }]}
        >
          <Input maxLength={120} />
        </Form.Item>
        <Form.Item
          name="due"
          label={t('new.due')}
          rules={[{ required: true, message: t('new.dueRequired') }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(day) => day.format('YYYY-MM-DD') < today}
          />
        </Form.Item>
        <Form.Item name="priority" label={t('new.priority')}>
          <Radio.Group
            optionType="button"
            options={TASK_PRIORITIES.map((value) => ({
              value,
              label: t(`priorities.${value}`),
            }))}
          />
        </Form.Item>
        {canAssign && (
          <Form.Item name="assignee_id" label={t('new.assignee')}>
            <Select
              allowClear
              placeholder={t('new.me')}
              options={(agents.data ?? []).map((item) => ({
                value: item.id,
                label: localized(item, 'name', locale),
              }))}
            />
          </Form.Item>
        )}
        <Form.Item name="notes" label={t('new.notes')}>
          <Input.TextArea rows={2} maxLength={300} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
