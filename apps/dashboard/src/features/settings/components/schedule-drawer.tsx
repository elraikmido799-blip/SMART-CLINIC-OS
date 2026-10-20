import { useEffect, useState } from 'react';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  Select,
  Switch,
  Tabs,
  TimePicker,
  Typography,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState } from '@/components/states/states';
import { useGetBranchesQuery } from '@/features/branches/branches.api';
import { clinicToday } from '@/lib/clinic-time';
import { WEEK_DAYS } from '../branch-types';
import {
  useAddLeaveMutation,
  useGetLeaveConflictsQuery,
  useRemoveLeaveMutation,
  useSaveWeeklyMutation,
} from '../schedules.api';
import type { DoctorSchedule } from '../schedule-types';

const FORMAT = 'HH:mm';

type WeeklyValues = {
  weekly: { day: number; off: boolean; branch_id: string; range: [Dayjs, Dayjs] }[];
};

/**
 * جدول دكتور (D-37): الأسبوع يوم بيوم (الفرع ومن/إلى أو إجازة) والإجازات بتواريخ. قبل ما تتسجل إجازة بيتعرض كام موعد
 * محجوز هيقع فيها. للي عنده `staff.manage` (مدير الفرع لدكاترة فرعه، والأدمن للكل).
 */
export function ScheduleDrawer({
  schedule,
  onClose,
}: {
  schedule: DoctorSchedule | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('settings');
  const locale = useLocale();
  const { message } = App.useApp();
  const branches = useGetBranchesQuery();
  const [form] = Form.useForm<WeeklyValues>();
  const [save, saveState] = useSaveWeeklyMutation();
  const [addLeave, addState] = useAddLeaveMutation();
  const [removeLeave] = useRemoveLeaveMutation();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [reason, setReason] = useState('');
  const from = range?.[0].format('YYYY-MM-DD') ?? '';
  const to = range?.[1].format('YYYY-MM-DD') ?? '';
  const conflicts = useGetLeaveConflictsQuery(
    { practitioner_id: schedule?.practitioner_id ?? '', from, to },
    { skip: !schedule || !range },
  );

  useEffect(() => {
    if (!schedule) return;
    form.setFieldsValue({
      weekly: schedule.weekly.map((entry) => ({
        day: entry.day,
        off: entry.off,
        branch_id: entry.branch_id,
        range: [dayjs(entry.start, FORMAT), dayjs(entry.end, FORMAT)],
      })),
    });
  }, [schedule, form]);

  const saveWeekly = async () => {
    if (!schedule) return;
    // كل القيم حتى اللي حقولها مستخبية (يوم إجازة مبيعرضش الفرع والساعات)
    const values = form.getFieldsValue(true) as WeeklyValues;
    try {
      await save({
        practitioner_id: schedule.practitioner_id,
        weekly: values.weekly.map((entry) => ({
          day: entry.day,
          off: entry.off,
          branch_id: entry.branch_id,
          start: entry.range[0].format(FORMAT),
          end: entry.range[1].format(FORMAT),
        })),
      }).unwrap();
      void message.success(t('schedules.saved'));
    } catch {
      void message.error(t('schedules.invalid'));
    }
  };

  const submitLeave = async () => {
    if (!schedule || !range) return;
    try {
      await addLeave({ practitioner_id: schedule.practitioner_id, from, to, reason }).unwrap();
      void message.success(t('schedules.leaveAdded'));
      setRange(null);
      setReason('');
    } catch {
      void message.error(t('schedules.invalid'));
    }
  };

  const branchOptions = (branches.data ?? []).map((branch) => ({
    value: branch.id,
    label: localized(branch, 'name', locale),
  }));

  return (
    <Drawer
      open={schedule !== null}
      onClose={onClose}
      destroyOnHidden
      size={560}
      title={schedule ? localized(schedule, 'name', locale) : ''}
    >
      {schedule && (
        <Tabs
          items={[
            {
              key: 'weekly',
              label: t('schedules.tabs.weekly'),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    weekly: schedule.weekly.map((entry) => ({
                      day: entry.day,
                      off: entry.off,
                      branch_id: entry.branch_id,
                      range: [dayjs(entry.start, FORMAT), dayjs(entry.end, FORMAT)],
                    })),
                  }}
                  onFinish={saveWeekly}
                >
                  <Form.List name="weekly">
                    {(fields) =>
                      fields.map((field) => (
                        <Flex
                          key={field.key}
                          gap={8}
                          align="center"
                          wrap
                          style={{ marginBottom: 12 }}
                        >
                          <Typography.Text strong style={{ width: 70 }}>
                            {t(`branches.days.${WEEK_DAYS[field.name]}`)}
                          </Typography.Text>
                          <Form.Item name={[field.name, 'off']} valuePropName="checked" noStyle>
                            <Switch
                              checkedChildren={t('schedules.off')}
                              unCheckedChildren={t('schedules.works')}
                            />
                          </Form.Item>
                          <Form.Item
                            noStyle
                            shouldUpdate={(previous, next) =>
                              previous.weekly?.[field.name]?.off !== next.weekly?.[field.name]?.off
                            }
                          >
                            {({ getFieldValue }) =>
                              !getFieldValue(['weekly', field.name, 'off']) && (
                                <>
                                  <Form.Item name={[field.name, 'branch_id']} noStyle>
                                    <Select
                                      options={branchOptions}
                                      aria-label={t('schedules.branch')}
                                      style={{ minWidth: 140 }}
                                    />
                                  </Form.Item>
                                  <Form.Item name={[field.name, 'range']} noStyle>
                                    <TimePicker.RangePicker
                                      format={FORMAT}
                                      minuteStep={15}
                                      allowClear={false}
                                    />
                                  </Form.Item>
                                </>
                              )
                            }
                          </Form.Item>
                        </Flex>
                      ))
                    }
                  </Form.List>
                  <Button type="primary" htmlType="submit" loading={saveState.isLoading}>
                    {t('schedules.save')}
                  </Button>
                </Form>
              ),
            },
            {
              key: 'leaves',
              label: `${t('schedules.tabs.leaves')} (${schedule.leaves.length})`,
              children: (
                <>
                  <Flex vertical gap={8} style={{ marginBottom: 16 }}>
                    <DatePicker.RangePicker
                      value={range}
                      onChange={(value) =>
                        setRange(value?.[0] && value[1] ? [value[0], value[1]] : null)
                      }
                      disabledDate={(day) => day.format('YYYY-MM-DD') < clinicToday()}
                      aria-label={t('schedules.leavePeriod')}
                    />
                    <Input
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      maxLength={120}
                      aria-label={t('schedules.reason')}
                      placeholder={t('schedules.reason')}
                    />
                    {range && (conflicts.data?.count ?? 0) > 0 && (
                      <Alert
                        type="warning"
                        showIcon
                        role="alert"
                        title={t('schedules.conflicts', { count: conflicts.data?.count })}
                      />
                    )}
                    <Button
                      type="primary"
                      disabled={!range}
                      loading={addState.isLoading}
                      onClick={() => void submitLeave()}
                    >
                      {t('schedules.addLeave')}
                    </Button>
                  </Flex>
                  {schedule.leaves.length === 0 ? (
                    <EmptyState title={t('schedules.noLeaves')} />
                  ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {schedule.leaves.map((leave) => (
                        <li
                          key={leave.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 0',
                            borderBlockEnd: '1px solid var(--ant-color-split)',
                          }}
                        >
                          <span>
                            {formatDate(leave.from, locale)} → {formatDate(leave.to, locale)}
                            {leave.reason && (
                              <Typography.Text type="secondary" style={{ display: 'block' }}>
                                {leave.reason}
                              </Typography.Text>
                            )}
                          </span>
                          <Button
                            type="text"
                            aria-label={t('schedules.removeLeave')}
                            icon={<Trash2 size={16} aria-hidden />}
                            onClick={() =>
                              void removeLeave({
                                practitioner_id: schedule.practitioner_id,
                                leave_id: leave.id,
                              })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}
