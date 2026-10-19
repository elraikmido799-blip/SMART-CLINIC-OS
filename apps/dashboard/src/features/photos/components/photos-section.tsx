import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from 'antd';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useCan } from '@/features/auth/use-me';
import { clinicToday } from '@/lib/clinic-time';
import { resizeToDataUrl } from '@/lib/image';
import { useGetPatientPhotosQuery, useUploadPatientPhotoMutation } from '../photos.api';
import { PHOTO_ANGLES, type PatientPhoto, type PhotoAngle } from '../types';

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

type UploadValues = { taken_on: string; angle: PhotoAngle; note: string };

function UploadModal({
  patientId,
  open,
  onClose,
}: {
  patientId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('photos');
  const { message } = App.useApp();
  const [form] = Form.useForm<UploadValues>();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState(false);
  const [upload, { isLoading }] = useUploadPatientPhotoMutation();

  const submit = async (values: UploadValues) => {
    if (!file) {
      setFileError(true);
      return;
    }
    try {
      const image = await resizeToDataUrl(file);
      await upload({ patient_id: patientId, ...values, note: values.note ?? '', image }).unwrap();
      void message.success(t('uploaded'));
      onClose();
    } catch {
      void message.error(t('errors.upload'));
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => {
        form.resetFields();
        setFile(null);
        setFileError(false);
      }}
      destroyOnHidden
      title={t('upload.title')}
      okText={t('upload.ok')}
      cancelText={t('upload.cancel')}
      confirmLoading={isLoading}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={submit}
        initialValues={{ taken_on: clinicToday(), angle: 'front', note: '' }}
      >
        <Form.Item
          label={t('upload.file')}
          validateStatus={fileError ? 'error' : undefined}
          help={fileError ? t('upload.fileRequired') : t('upload.fileHelp')}
        >
          <input
            type="file"
            accept="image/*"
            aria-label={t('upload.file')}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setFileError(false);
            }}
          />
        </Form.Item>
        <Form.Item
          name="taken_on"
          label={t('upload.takenOn')}
          rules={[{ required: true, message: t('upload.dateRequired') }]}
        >
          <Input type="date" max={clinicToday()} style={{ maxWidth: 200 }} />
        </Form.Item>
        <Form.Item name="angle" label={t('upload.angle')}>
          <Select
            options={PHOTO_ANGLES.map((value) => ({ value, label: t(`angles.${value}`) }))}
            style={{ maxWidth: 240 }}
          />
        </Form.Item>
        <Form.Item name="note" label={t('upload.note')}>
          <Input maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function Compare({ before, after }: { before: PatientPhoto; after: PatientPhoto }) {
  const { t } = useTranslation('photos');
  const locale = useLocale();
  // الأقدم "قبل" والأحدث "بعد" بغض النظر عن ترتيب الاختيار
  const [first, second] = before.taken_on <= after.taken_on ? [before, after] : [after, before];

  return (
    <Card title={t('compare.title')} style={{ marginBottom: 16 }}>
      {first.angle !== second.angle && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          title={t('compare.angleWarning')}
        />
      )}
      <Row gutter={[16, 16]}>
        {[
          { photo: first, label: t('compare.before') },
          { photo: second, label: t('compare.after') },
        ].map(({ photo, label }) => (
          <Col xs={24} md={12} key={photo.id}>
            <Typography.Text strong>{label}</Typography.Text>
            <img
              src={photo.image_url}
              alt={t('alt', {
                angle: t(`angles.${photo.angle}`),
                date: formatDate(photo.taken_on, locale),
              })}
              style={{ width: '100%', borderRadius: 12, display: 'block', marginBlock: 8 }}
            />
            <Typography.Text type="secondary">
              {formatDate(photo.taken_on, locale)} · {t(`angles.${photo.angle}`)}
            </Typography.Text>
          </Col>
        ))}
      </Row>
      <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
        {t('compare.between', { count: daysBetween(first.taken_on, second.taken_on) })}
      </Typography.Paragraph>
    </Card>
  );
}

/**
 * صور المريض (D-14 · docs/20 · 4.7): معرض بتاريخ التصوير والزاوية + رفع صورة + مقارنة صورتين جنب بعض
 * (قبل / بعد). الرفع للدكتور والأخصائي والمساعد (§clinical.capture§).
 */
export function PhotosSection({ patientId }: { patientId: string }) {
  const { t } = useTranslation('photos');
  const locale = useLocale();
  const canUpload = useCan(
    'derm_im.write',
    'medical.write',
    'clinical.capture',
    'documents.upload',
  );
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const { data, isLoading, isError, refetch } = useGetPatientPhotosQuery(patientId);

  const chosen = (data ?? []).filter((photo) => selected.includes(photo.id));

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) =>
      checked
        ? [...current.filter((item) => item !== id), id].slice(-2)
        : current.filter((item) => item !== id),
    );

  return (
    <Card
      title={t('title')}
      extra={
        canUpload ? (
          <Button icon={<Camera size={16} aria-hidden />} onClick={() => setUploading(true)}>
            {t('upload.button')}
          </Button>
        ) : undefined
      }
    >
      {chosen.length === 2 && <Compare before={chosen[0]} after={chosen[1]} />}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <>
          <Typography.Paragraph type="secondary">{t('pickTwo')}</Typography.Paragraph>
          <Row gutter={[16, 16]}>
            {data.map((photo) => (
              <Col xs={12} md={8} xl={6} key={photo.id}>
                <div
                  style={{
                    border: `1px solid ${selected.includes(photo.id) ? tokens.color.primary : tokens.color.border}`,
                    borderRadius: 12,
                    padding: 8,
                  }}
                >
                  <img
                    src={photo.image_url}
                    alt={t('alt', {
                      angle: t(`angles.${photo.angle}`),
                      date: formatDate(photo.taken_on, locale),
                    })}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: 8,
                      display: 'block',
                    }}
                  />
                  <Flex vertical gap={2} style={{ marginTop: 8 }}>
                    <Typography.Text strong>{formatDate(photo.taken_on, locale)}</Typography.Text>
                    <Typography.Text type="secondary">{t(`angles.${photo.angle}`)}</Typography.Text>
                    {photo.note && <Typography.Text>{photo.note}</Typography.Text>}
                    <Checkbox
                      checked={selected.includes(photo.id)}
                      onChange={(event) => toggle(photo.id, event.target.checked)}
                    >
                      {t('compare.select')}
                    </Checkbox>
                  </Flex>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
      <UploadModal patientId={patientId} open={uploading} onClose={() => setUploading(false)} />
    </Card>
  );
}
