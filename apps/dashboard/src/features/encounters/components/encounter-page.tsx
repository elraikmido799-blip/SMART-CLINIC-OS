import { useEffect, useRef, useState } from 'react';
import { Alert, App, Button, Card, Col, Flex, Form, Row, Switch, Typography } from 'antd';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { directionOf, formatDate, formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import {
  useGetEncounterQuery,
  useSaveEncounterDraftMutation,
  useSignEncounterMutation,
} from '../encounters.api';
import { encounterErrorKey } from '../errors';
import type { Encounter, EncounterData } from '../types';
import { FormRenderer } from './form-renderer';
import { PatientSidebar } from './patient-sidebar';

// المسودة بتتحفظ بعد ما الدكتور يبطّل كتابة بالمدة دي
const AUTOSAVE_MS = 1500;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function EncounterEditor({ encounter }: { encounter: Encounter }) {
  const { t } = useTranslation('encounters');
  const locale = useLocale();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<EncounterData>();
  const [saveDraft] = useSaveEncounterDraftMutation();
  const [sign, signState] = useSignEncounterMutation();
  const [visible, setVisible] = useState(encounter.patient_visible);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState(encounter.updated_at);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const signed = encounter.status === 'signed';
  const rtl = directionOf(locale) === 'rtl';
  const Back = rtl ? ArrowRight : ArrowLeft;

  useEffect(() => () => clearTimeout(timer.current), []);

  const save = async (patientVisible = visible) => {
    clearTimeout(timer.current);
    setSaveState('saving');
    try {
      const result = await saveDraft({
        id: encounter.id,
        data: form.getFieldsValue(true) as EncounterData,
        patient_visible: patientVisible,
      }).unwrap();
      setSavedAt(result.updated_at);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const scheduleSave = () => {
    setSaveState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), AUTOSAVE_MS);
  };

  const doSign = async () => {
    clearTimeout(timer.current);
    try {
      await sign({
        id: encounter.id,
        data: form.getFieldsValue(true) as EncounterData,
        patient_visible: visible,
      }).unwrap();
      void message.success(t('messages.signed'));
    } catch (error) {
      void message.error(t(encounterErrorKey(error)));
    }
  };

  // التحقق من الإجباري الأول، وبعدين تأكيد (التوقيع بيقفل الكشف)
  const onSign = async () => {
    try {
      await form.validateFields();
    } catch {
      void message.error(t('messages.requiredMissing'));
      return;
    }
    modal.confirm({
      title: t('sign.confirmTitle'),
      content: t('sign.confirmBody'),
      okText: t('sign.ok'),
      cancelText: t('sign.cancel'),
      onOk: doSign,
    });
  };

  const goToPatient = () =>
    void navigate({ to: '/patients/$patientId', params: { patientId: encounter.patient.id } });

  const statusText =
    saveState === 'saving'
      ? t('footer.saving')
      : saveState === 'dirty'
        ? t('footer.dirty')
        : saveState === 'error'
          ? t('footer.error')
          : saveState === 'saved'
            ? t('footer.saved', { time: formatSlot(savedAt, locale).time })
            : '';

  return (
    <>
      <PageHeader
        title={t('title')}
        description={
          <Flex gap={8} align="center" wrap component="span">
            <SpecialtyTag specialty={encounter.specialty} />
            <span>{localized(encounter.practitioner, 'name', locale)}</span>
          </Flex>
        }
        extra={
          <Button icon={<Back size={16} aria-hidden />} onClick={goToPatient}>
            {t('backToPatient')}
          </Button>
        }
      />
      {signed && encounter.signed_at && encounter.signed_by && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          title={t('footer.signedBanner', {
            name: localized(encounter.signed_by, 'name', locale),
            date: formatDate(encounter.signed_at.slice(0, 10), locale),
            time: formatSlot(encounter.signed_at, locale).time,
          })}
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8} xl={6}>
          <PatientSidebar encounter={encounter} />
        </Col>
        <Col xs={24} lg={16} xl={12}>
          <Card title={localized(encounter.template, 'title', locale)}>
            <Form
              form={form}
              layout="vertical"
              disabled={signed}
              initialValues={encounter.data}
              onValuesChange={scheduleSave}
              scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
              requiredMark={false}
            >
              <FormRenderer template={encounter.template} />
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card title={t('plan.title')}>
            <Flex vertical align="center" gap={8} style={{ textAlign: 'center', padding: 16 }}>
              <ClipboardList size={28} color={tokens.color.mutedText} aria-hidden />
              <Typography.Text type="secondary">{t('plan.body')}</Typography.Text>
            </Flex>
          </Card>
        </Col>
      </Row>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          marginTop: 16,
          padding: '12px 16px',
          background: tokens.color.surface,
          borderTop: `1px solid ${tokens.color.border}`,
          borderRadius: 16,
          zIndex: 5,
        }}
      >
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Flex gap={12} align="center" wrap>
            <Switch
              checked={visible}
              disabled={signed}
              aria-labelledby="share-label"
              onChange={(checked) => {
                setVisible(checked);
                void save(checked);
              }}
            />
            <span id="share-label">{t('footer.share')}</span>
            <Typography.Text type="secondary" role="status">
              {statusText}
            </Typography.Text>
          </Flex>
          <Flex gap={8} wrap>
            {signed ? (
              <Button type="primary" onClick={goToPatient}>
                {t('backToPatient')}
              </Button>
            ) : (
              <>
                <Button onClick={() => void save()} disabled={saveState === 'saving'}>
                  {t('footer.saveDraft')}
                </Button>
                <Button type="primary" loading={signState.isLoading} onClick={() => void onSign()}>
                  {t('footer.sign')}
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </div>
    </>
  );
}

/** شاشة الكشف (D-11 · docs/20 · 4.3): الفورم بيتبني من Template، والمسودة بتتحفظ تلقائي، و"وقّع واقفل" بيقفل الكشف */
export function EncounterPage() {
  const { t } = useTranslation('encounters');
  const { encounterId } = useParams({ from: '/_app/encounters/$encounterId' });
  const canRead = useCan('medical.read');
  const { data, isLoading, isError, error, refetch } = useGetEncounterQuery(encounterId, {
    skip: !canRead,
  });

  if (!canRead) {
    return (
      <Card>
        <EmptyState level={1} title={t('forbidden.title')} description={t('forbidden.body')} />
      </Card>
    );
  }
  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    const notFound = !!error && 'status' in error && error.status === 404;
    return notFound ? (
      <Card>
        <EmptyState level={1} title={t('notFound.title')} description={t('notFound.body')} />
      </Card>
    ) : (
      <Card>
        <ErrorState level={1} onRetry={() => void refetch()} />
      </Card>
    );
  }
  // key = id: كل كشف بفورم جديد (مفيش قيم من كشف قبله)
  return <EncounterEditor key={data.id} encounter={data} />;
}
