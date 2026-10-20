import { useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  Typography,
} from 'antd';
import { FlaskConical, HeartPulse } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import type { Tone } from '@/app/tones';
import { useCan } from '@/features/auth/use-me';
import { clinicToday } from '@/lib/clinic-time';
import {
  useAddLabMutation,
  useAddVitalsMutation,
  useGetMeasurementsQuery,
} from '../measurements.api';
import { labFlag, type Lab, type LabFlag, type Vital } from '../types';
import { MedicationsPanel } from './medications-panel';
import { Sparkline } from './sparkline';

const FLAG_TONE: Record<LabFlag, Tone> = {
  low: 'info',
  high: 'danger',
  normal: 'success',
  none: 'neutral',
};

type VitalsValues = { systolic: number; diastolic: number; heart_rate: number; weight_kg: number };
type LabValues = {
  name: string;
  value: number;
  unit: string;
  min: number | null;
  max: number | null;
};

function VitalsModal({
  patientId,
  open,
  onClose,
}: {
  patientId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('measurements');
  const { message } = App.useApp();
  const [form] = Form.useForm<VitalsValues>();
  const [add, { isLoading }] = useAddVitalsMutation();

  const fields = [
    { name: 'systolic', min: 60, max: 260 },
    { name: 'diastolic', min: 30, max: 160 },
    { name: 'heart_rate', min: 30, max: 220 },
    { name: 'weight_kg', min: 20, max: 300 },
  ] as const;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => form.resetFields()}
      destroyOnHidden
      title={t('vitals.addTitle')}
      okText={t('save')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={async (values) => {
          try {
            await add({ patient_id: patientId, ...values }).unwrap();
            void message.success(t('vitals.added'));
            onClose();
          } catch {
            void message.error(t('errors.invalid'));
          }
        }}
      >
        <Row gutter={12}>
          {fields.map((field) => (
            <Col span={12} key={field.name}>
              <Form.Item
                name={field.name}
                label={t(`vitals.${field.name}`)}
                rules={[
                  { required: true, message: t('required') },
                  {
                    type: 'number',
                    min: field.min,
                    max: field.max,
                    message: t('range', { min: field.min, max: field.max }),
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
}

function LabModal({
  patientId,
  open,
  onClose,
}: {
  patientId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('measurements');
  const { message } = App.useApp();
  const [form] = Form.useForm<LabValues>();
  const [add, { isLoading }] = useAddLabMutation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => form.resetFields()}
      destroyOnHidden
      title={t('labs.addTitle')}
      okText={t('save')}
      cancelText={t('cancel')}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={async (values) => {
          try {
            await add({
              patient_id: patientId,
              date: clinicToday(),
              ...values,
              unit: values.unit ?? '',
              min: values.min ?? null,
              max: values.max ?? null,
            }).unwrap();
            void message.success(t('labs.added'));
            onClose();
          } catch {
            void message.error(t('errors.invalid'));
          }
        }}
      >
        <Form.Item
          name="name"
          label={t('labs.name')}
          rules={[{ required: true, whitespace: true, message: t('required') }]}
        >
          <Input dir="ltr" />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="value"
              label={t('labs.value')}
              rules={[{ required: true, message: t('required') }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label={t('labs.unit')}>
              <Input dir="ltr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="min" label={t('labs.min')}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="max" label={t('labs.max')}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

const rangeText = (lab: Lab, locale: 'ar' | 'en') => {
  const n = (value: number) => formatNumber(value, locale);
  if (lab.min !== null && lab.max !== null) return `${n(lab.min)} – ${n(lab.max)}`;
  if (lab.max !== null) return `< ${n(lab.max)}`;
  if (lab.min !== null) return `> ${n(lab.min)}`;
  return '—';
};

/**
 * تاب "القياسات" (D-15 · docs/20 · 4.8): العلامات الحيوية عبر الوقت (آخر 8 قراءات + خط الاتجاه) ·
 * التحاليل بمعدلاتها الطبيعية (طبيعي / عالي / واطي بالكلام واللون) · الأدوية.
 * المساعد بيدخّل العلامات (§vitals.write§)، والدكتور بيضيف التحاليل ويعدّل الأدوية.
 */
export function MeasurementsTab({ patientId }: { patientId: string }) {
  const { t } = useTranslation('measurements');
  const locale = useLocale();
  const canVitals = useCan('vitals.write', 'clinical.capture', 'medical.write');
  const canClinical = useCan('derm_im.write', 'medical.write', 'physio.write', 'nutrition.write');
  const [addingVitals, setAddingVitals] = useState(false);
  const [addingLab, setAddingLab] = useState(false);
  const { data, isLoading, isError, refetch } = useGetMeasurementsQuery(patientId);

  const vitals = data?.vitals ?? [];
  const latest = vitals.at(-1);
  const trends = [
    { key: 'systolic', label: t('vitals.systolic'), values: vitals.map((item) => item.systolic) },
    {
      key: 'heart_rate',
      label: t('vitals.heart_rate'),
      values: vitals.map((item) => item.heart_rate),
    },
    {
      key: 'weight_kg',
      label: t('vitals.weight_kg'),
      values: vitals.map((item) => item.weight_kg),
    },
  ] as const;

  return (
    <Flex vertical gap={16}>
      <Card
        title={t('vitals.title')}
        extra={
          canVitals ? (
            <Button
              icon={<HeartPulse size={16} aria-hidden />}
              onClick={() => setAddingVitals(true)}
            >
              {t('vitals.add')}
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !latest ? (
          <EmptyState title={t('vitals.empty')} />
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {trends.map((trend) => (
                <Col xs={24} md={8} key={trend.key}>
                  <Typography.Text type="secondary">{trend.label}</Typography.Text>
                  <Flex align="center" justify="space-between" gap={8}>
                    <span style={{ fontSize: 22, fontWeight: 600 }}>
                      {formatNumber(trend.values.at(-1)!, locale)}
                    </span>
                    <Sparkline values={[...trend.values]} />
                  </Flex>
                </Col>
              ))}
            </Row>
            <Table<Vital>
              rowKey="id"
              dataSource={[...vitals].reverse()}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: t('date'),
                  dataIndex: 'date',
                  render: (value: string) => formatDate(value, locale),
                },
                {
                  title: t('vitals.bloodPressure'),
                  render: (_, item) => (
                    <span dir="ltr">{`${item.systolic}/${item.diastolic}`}</span>
                  ),
                },
                { title: t('vitals.heart_rate'), dataIndex: 'heart_rate' },
                { title: t('vitals.weight_kg'), dataIndex: 'weight_kg' },
                { title: t('vitals.bmi'), dataIndex: 'bmi' },
              ]}
            />
          </>
        )}
      </Card>

      <Card
        title={t('labs.title')}
        extra={
          canClinical ? (
            <Button
              icon={<FlaskConical size={16} aria-hidden />}
              onClick={() => setAddingLab(true)}
            >
              {t('labs.add')}
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : (
          <Table<Lab>
            rowKey="id"
            dataSource={data?.labs}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <EmptyState title={t('labs.empty')} /> }}
            columns={[
              {
                title: t('labs.name'),
                dataIndex: 'name',
                render: (value: string) => <span dir="ltr">{value}</span>,
              },
              {
                title: t('labs.result'),
                render: (_, item) => (
                  <span dir="ltr">
                    {formatNumber(item.value, locale)} {item.unit}
                  </span>
                ),
              },
              {
                title: t('labs.range'),
                render: (_, item) => <span dir="ltr">{rangeText(item, locale)}</span>,
              },
              {
                title: t('labs.status'),
                render: (_, item) => {
                  const flag = labFlag(item);
                  return <StatusTag tone={FLAG_TONE[flag]}>{t(`labs.flags.${flag}`)}</StatusTag>;
                },
              },
              {
                title: t('date'),
                dataIndex: 'date',
                render: (value: string) => formatDate(value, locale),
              },
            ]}
          />
        )}
      </Card>

      <MedicationsPanel patientId={patientId} readOnly={!canClinical} />
      <VitalsModal
        patientId={patientId}
        open={addingVitals}
        onClose={() => setAddingVitals(false)}
      />
      <LabModal patientId={patientId} open={addingLab} onClose={() => setAddingLab(false)} />
    </Flex>
  );
}
