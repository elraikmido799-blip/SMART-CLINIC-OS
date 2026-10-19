import { useState } from 'react';
import { App, Button, Card, Flex, Modal, Select, Typography } from 'antd';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import type { Enrollment } from '../enrollment-types';
import { useEnrollPatientMutation, useGetPatientEnrollmentsQuery } from '../enrollments.api';
import { useGetProgramQuery, useGetProgramsQuery } from '../programs.api';
import { daysInStage, daysLate } from '../stage-timing';

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const { data: program } = useGetProgramQuery(enrollment.program_id);
  const stages = program?.stages ?? [];
  const stage = stages.find((item) => item.id === enrollment.stage_id);
  const stageName = (id: string | null) => {
    const found = stages.find((item) => item.id === id);
    return found ? localized(found, 'name', locale) : '—';
  };
  const late = stage ? daysLate(enrollment, stage) : 0;

  return (
    <Card
      title={program ? localized(program, 'name', locale) : '…'}
      extra={
        late > 0 ? (
          <StatusTag tone="danger">{t('board.late', { count: late })}</StatusTag>
        ) : undefined
      }
    >
      <Typography.Paragraph>
        <Typography.Text type="secondary">{t('tab.currentStage')}: </Typography.Text>
        <Typography.Text strong>{stage ? localized(stage, 'name', locale) : '—'}</Typography.Text>
        {' · '}
        {t('board.daysIn', { count: daysInStage(enrollment) })}
        {stage && ` · ${t('board.expected', { count: stage.expected_days })}`}
      </Typography.Paragraph>
      {enrollment.owner && (
        <Typography.Paragraph type="secondary">
          {t('tab.owner', { name: localized(enrollment.owner, 'name', locale) })}
        </Typography.Paragraph>
      )}
      <Typography.Title level={3} style={{ fontSize: 15 }}>
        {t('tab.history')}
      </Typography.Title>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {[...enrollment.history].reverse().map((event) => (
          <li key={event.id} style={{ marginBottom: 10 }}>
            <Typography.Text strong>
              {event.from_stage_id === null
                ? t('tab.enrolled', { stage: stageName(event.to_stage_id) })
                : t('tab.moved', {
                    from: stageName(event.from_stage_id),
                    to: stageName(event.to_stage_id),
                  })}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {formatDate(event.at.slice(0, 10), locale)} · {localized(event.by, 'name', locale)}
            </Typography.Text>
            {event.note && <div>{event.note}</div>}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function EnrollHere({
  patientId,
  branchId,
  taken,
  open,
  onClose,
}: {
  patientId: string;
  branchId: string;
  taken: Set<string>;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const { message } = App.useApp();
  const [programId, setProgramId] = useState<string>();
  const programs = useGetProgramsQuery();
  const [enroll, { isLoading }] = useEnrollPatientMutation();
  const options = (programs.data ?? []).filter(
    (item) => item.status === 'active' && !taken.has(item.id),
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => setProgramId(undefined)}
      destroyOnHidden
      title={t('tab.enrollTitle')}
      okText={t('enroll.ok')}
      cancelText={t('cancel')}
      okButtonProps={{ disabled: !programId, loading: isLoading }}
      onOk={async () => {
        if (!programId) return;
        try {
          await enroll({
            program_id: programId,
            patient_id: patientId,
            branch_id: branchId,
          }).unwrap();
          void message.success(t('enroll.done'));
          onClose();
        } catch (error) {
          void message.error(
            apiErrorCode(error as never) === 'ALREADY_ENROLLED'
              ? t('errors.ALREADY_ENROLLED')
              : t('errors.generic'),
          );
        }
      }}
    >
      <Select
        aria-label={t('board.program')}
        placeholder={t('board.program')}
        value={programId}
        onChange={setProgramId}
        notFoundContent={t('tab.noPrograms')}
        options={options.map((item) => ({
          value: item.id,
          label: localized(item, 'name', locale),
        }))}
        style={{ width: '100%' }}
      />
    </Modal>
  );
}

/** تاب "البرامج" في ملف المريض (5.2): برامجه ومرحلته الحالية وتاريخ انتقالاته + "سجّله في برنامج" */
export function ProgramsTab({ patientId, branchId }: { patientId: string; branchId: string }) {
  const { t } = useTranslation('programs');
  const canEnroll = useCan('programs.enroll');
  const [enrolling, setEnrolling] = useState(false);
  const { data, isLoading, isError, refetch } = useGetPatientEnrollmentsQuery(patientId);
  const active = (data ?? []).filter((item) => item.status === 'active');

  return (
    <Flex vertical gap={16}>
      {canEnroll && (
        <Flex justify="end">
          <Button icon={<UserPlus size={16} aria-hidden />} onClick={() => setEnrolling(true)}>
            {t('tab.enroll')}
          </Button>
        </Flex>
      )}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <Card>
          <EmptyState title={t('tab.empty')} />
        </Card>
      ) : (
        data.map((item) => <EnrollmentCard key={item.id} enrollment={item} />)
      )}
      <EnrollHere
        patientId={patientId}
        branchId={branchId}
        taken={new Set(active.map((item) => item.program_id))}
        open={enrolling}
        onClose={() => setEnrolling(false)}
      />
    </Flex>
  );
}
