import { useState } from 'react';
import { Alert, App, Button, DatePicker, Flex, Form, Input, Modal, Select, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  formatEgyptianMobile,
  formatMoney,
  formatTime,
  localized,
  normalizeEgyptianMobile,
} from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { RegisterPatientDrawer } from '@/features/patients/components/register-patient-drawer';
import { useDebounced } from '@/lib/use-debounced';
import { clinicIso, clinicMinutes, clinicNowMinutes, clinicToday } from '@/lib/clinic-time';
import {
  useCreateAppointmentMutation,
  useGetServicesQuery,
  useRescheduleAppointmentMutation,
  useSearchPatientsQuery,
} from '../appointments.api';
import { calendarErrorKey, type CalendarErrorKey } from '../errors';
import { DAY_END, SLOT_MIN, SLOTS, toHHmm } from '../grid';
import type { Appointment, PatientSummary, Practitioner } from '../types';

export type BookingMode =
  // patient: مريض متختار من الأول (بعد التسجيل، أو "احجز له")
  | {
      kind: 'new';
      practitionerId?: string;
      date: string;
      minutes?: number;
      patient?: PatientSummary;
    }
  | { kind: 'reschedule'; appointment: Appointment };

type Values = {
  patient_id: string;
  practitioner_id: string;
  service_id: string;
  date: Dayjs;
  minutes: number;
  notes?: string;
};

type Props = {
  mode: BookingMode | null;
  branchId: string;
  practitioners: Practitioner[];
  onClose: () => void;
};

/**
 * حجز جديد أو تأجيل ميعاد (3.2): المريض (بحث) · الدكتور · الخدمة (حسب تخصص الدكتور) · اليوم · الساعة.
 * في التأجيل المريض والخدمة ثابتين، والدكتور من نفس التخصص بس.
 */
export function BookingModal({ mode, branchId, practitioners, onClose }: Props) {
  const { t } = useTranslation('calendar');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { message } = App.useApp();
  const [form] = Form.useForm<Values>();
  const [query, setQuery] = useState('');
  const [errorKey, setErrorKey] = useState<CalendarErrorKey | null>(null);
  // مرضى مش جايين من البحث (المتختار من الأول، أو اللي اتسجل دلوقتي)
  const [extraPatients, setExtraPatients] = useState<PatientSummary[]>([]);
  const [registering, setRegistering] = useState(false);
  const search = useDebounced(query.trim());
  // المرضى بيتسجلوا طول الوقت: البحث بيتجاب جديد كل مرة الفورم يفتح (P-32)
  const patients = useSearchPatientsQuery(
    { q: search },
    { skip: search.length < 2, refetchOnMountOrArgChange: true },
  );
  const { data: services = [] } = useGetServicesQuery();
  const [create, createState] = useCreateAppointmentMutation();
  const [reschedule, rescheduleState] = useRescheduleAppointmentMutation();

  const rescheduling = mode?.kind === 'reschedule' ? mode.appointment : null;
  const practitionerId = Form.useWatch('practitioner_id', form);
  const date = Form.useWatch('date', form);
  const serviceId = Form.useWatch('service_id', form);
  const practitioner = practitioners.find((item) => item.id === practitionerId);
  const today = clinicToday();
  const isToday = date ? date.format('YYYY-MM-DD') === today : false;
  const now = clinicNowMinutes();
  // الميعاد لازم يخلص قبل آخر اليوم: الساعات اللي متساعش مدة الخدمة بتتقفل
  const duration = rescheduling
    ? clinicMinutes(rescheduling.ends_at) - clinicMinutes(rescheduling.starts_at)
    : (services.find((service) => service.id === serviceId)?.duration_min ?? SLOT_MIN);

  const initialValues: Partial<Values> | undefined = !mode
    ? undefined
    : mode.kind === 'new'
      ? {
          patient_id: mode.patient?.id,
          practitioner_id: mode.practitionerId,
          date: dayjs(mode.date),
          minutes: mode.minutes,
        }
      : {
          patient_id: mode.appointment.patient.id,
          practitioner_id: mode.appointment.practitioner_id,
          service_id: mode.appointment.service.id,
          date: dayjs(mode.appointment.starts_at.slice(0, 10)),
          minutes: clinicMinutes(mode.appointment.starts_at),
        };

  const choices = rescheduling
    ? practitioners.filter((item) => item.specialty === rescheduling.service.specialty)
    : practitioners;

  const submit = async (values: Values) => {
    setErrorKey(null);
    const startsAt = clinicIso(values.date.format('YYYY-MM-DD'), values.minutes);
    try {
      if (rescheduling) {
        await reschedule({
          id: rescheduling.id,
          starts_at: startsAt,
          practitioner_id: values.practitioner_id,
        }).unwrap();
        void message.success(t('booking.rescheduled'));
      } else {
        await create({
          branch_id: branchId,
          practitioner_id: values.practitioner_id,
          patient_id: values.patient_id,
          service_id: values.service_id,
          starts_at: startsAt,
          notes: values.notes,
        }).unwrap();
        void message.success(t('booking.created'));
      }
      onClose();
    } catch (error) {
      setErrorKey(calendarErrorKey(error));
    }
  };

  const required = (field: string) => [
    { required: true, message: t('booking.required', { field }) },
  ];

  return (
    <Modal
      open={!!mode}
      title={rescheduling ? t('booking.rescheduleTitle') : t('booking.newTitle')}
      okText={rescheduling ? t('booking.submitReschedule') : t('booking.submitNew')}
      cancelText={tCommon('actions.cancel')}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={createState.isLoading || rescheduleState.isLoading}
      destroyOnHidden
      afterClose={() => {
        // الـform instance برة الـModal وبيحتفظ بالقيم: المرة الجاية تبدأ من initialValues (P-33)
        form.resetFields();
        setQuery('');
        setErrorKey(null);
        setExtraPatients([]);
      }}
    >
      <Form<Values>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues}
        onFinish={submit}
        onValuesChange={(changed) => {
          // الدكتور اتغير لتخصص تاني: الخدمة القديمة مبقتش تنفع
          if ('practitioner_id' in changed && !rescheduling)
            form.setFieldValue('service_id', undefined);
        }}
      >
        <Form.Item
          name="patient_id"
          label={t('booking.patient')}
          rules={required(t('booking.patient'))}
        >
          {rescheduling ? (
            <Select
              disabled
              options={[
                {
                  value: rescheduling.patient.id,
                  label: `${localized(rescheduling.patient, 'name', locale)} · ${rescheduling.patient.file_no}`,
                },
              ]}
            />
          ) : (
            <Select
              showSearch={{ filterOption: false, onSearch: setQuery }}
              placeholder={t('booking.patientPlaceholder')}
              loading={patients.isFetching}
              notFoundContent={
                search.length < 2 ? (
                  <Typography.Text type="secondary">{t('booking.patientHint')}</Typography.Text>
                ) : (
                  <Flex vertical align="start" gap={4}>
                    <Typography.Text type="secondary">{t('booking.patientNone')}</Typography.Text>
                    <Button
                      type="link"
                      style={{ paddingInline: 0 }}
                      onClick={() => setRegistering(true)}
                    >
                      {t('booking.registerNew')}
                    </Button>
                  </Flex>
                )
              }
              options={[
                ...(mode?.kind === 'new' && mode.patient ? [mode.patient] : []),
                ...extraPatients,
                ...(search.length < 2 ? [] : (patients.data ?? [])),
              ]
                .filter(
                  (patient, index, list) =>
                    list.findIndex((item) => item.id === patient.id) === index,
                )
                .map((patient) => ({
                  value: patient.id,
                  label: `${localized(patient, 'name', locale)} · ${patient.file_no} · ${formatEgyptianMobile(patient.phone)}`,
                }))}
            />
          )}
        </Form.Item>

        <Form.Item
          name="practitioner_id"
          label={t('booking.practitioner')}
          rules={required(t('booking.practitioner'))}
        >
          <Select
            options={choices.map((item) => ({
              value: item.id,
              label: `${localized(item, 'name', locale)} · ${tCommon(`specialties.${item.specialty}`)}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="service_id"
          label={t('booking.service')}
          rules={required(t('booking.service'))}
        >
          <Select
            disabled={!!rescheduling || !practitioner}
            options={services
              .filter((service) => !practitioner || service.specialty === practitioner.specialty)
              .map((service) => ({
                value: service.id,
                label: `${localized(service, 'name', locale)} — ${t('booking.duration', {
                  minutes: service.duration_min,
                  price: formatMoney(service.price, 'EGP', locale),
                })}`,
              }))}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item
            name="date"
            label={t('booking.date')}
            rules={required(t('booking.date'))}
            style={{ flex: 1 }}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="dddd D MMMM"
              allowClear={false}
              disabledDate={(day) => day.format('YYYY-MM-DD') < today}
            />
          </Form.Item>
          <Form.Item
            name="minutes"
            label={t('booking.time')}
            rules={required(t('booking.time'))}
            style={{ flex: 1 }}
          >
            <Select
              options={SLOTS.map((minutes) => ({
                value: minutes,
                label: formatTime(toHHmm(minutes), locale),
                disabled: (isToday && minutes < now) || minutes + duration > DAY_END,
              }))}
            />
          </Form.Item>
        </div>

        {!rescheduling && (
          <Form.Item name="notes" label={t('booking.notes')}>
            <Input.TextArea maxLength={300} showCount autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        )}

        {errorKey && <Alert type="error" showIcon role="alert" title={t(errorKey)} />}
      </Form>
      <RegisterPatientDrawer
        open={registering}
        // اللي اتكتب في البحث: رقم ← الموبايل، غير كده ← الاسم
        prefill={normalizeEgyptianMobile(query) ? { phone: query } : { name: query }}
        onClose={() => setRegistering(false)}
        onRegistered={(patient) => {
          setExtraPatients((list) => [...list, patient]);
          form.setFieldValue('patient_id', patient.id);
          setRegistering(false);
        }}
        onBook={(patient) => {
          setExtraPatients((list) => [...list, patient]);
          form.setFieldValue('patient_id', patient.id);
        }}
      />
    </Modal>
  );
}
