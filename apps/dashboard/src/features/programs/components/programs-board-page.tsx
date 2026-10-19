import { useState } from 'react';
import { App, Button, Card, Flex, Form, Input, Modal, Select, Switch, Typography } from 'antd';
import { UserPlus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useSearchPatientsQuery } from '@/features/appointments/appointments.api';
import { useCan } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { apiErrorCode } from '@/lib/api-error';
import { useDebounced } from '@/lib/use-debounced';
import { ALL_BRANCHES } from '@/store/ui-slice';
import type { Enrollment } from '../enrollment-types';
import {
  useEnrollPatientMutation,
  useGetEnrollmentsQuery,
  useMoveEnrollmentStageMutation,
} from '../enrollments.api';
import { useGetProgramQuery, useGetProgramsQuery } from '../programs.api';
import { daysInStage, daysLate } from '../stage-timing';
import type { Program } from '../types';

function EnrollModal({
  program,
  branchId,
  open,
  onClose,
}: {
  program: Program;
  branchId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const { message } = App.useApp();
  const [query, setQuery] = useState('');
  const [patientId, setPatientId] = useState<string>();
  const search = useDebounced(query.trim());
  const { data, isFetching } = useSearchPatientsQuery({ q: search }, { skip: search.length < 2 });
  const [enroll, { isLoading }] = useEnrollPatientMutation();

  const submit = async () => {
    if (!patientId) return;
    try {
      await enroll({ program_id: program.id, patient_id: patientId, branch_id: branchId }).unwrap();
      void message.success(t('enroll.done'));
      onClose();
    } catch (error) {
      const code = apiErrorCode(error as never);
      void message.error(
        code === 'ALREADY_ENROLLED' ? t('errors.ALREADY_ENROLLED') : t('errors.generic'),
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={() => {
        setQuery('');
        setPatientId(undefined);
      }}
      destroyOnHidden
      title={t('enroll.title', { program: localized(program, 'name', locale) })}
      okText={t('enroll.ok')}
      cancelText={t('cancel')}
      okButtonProps={{ disabled: !patientId, loading: isLoading }}
      onOk={() => void submit()}
    >
      <Form layout="vertical" component="div">
        <Form.Item label={t('enroll.patient')} extra={t('enroll.hint')}>
          <Select
            showSearch
            aria-label={t('enroll.patient')}
            filterOption={false}
            onSearch={setQuery}
            value={patientId}
            onChange={setPatientId}
            loading={isFetching}
            notFoundContent={search.length < 2 ? t('enroll.typeMore') : t('enroll.none')}
            options={(data ?? []).map((patient) => ({
              value: patient.id,
              label: `${localized(patient, 'name', locale)} · ${patient.file_no}`,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function MoveModal({
  target,
  program,
  onClose,
}: {
  target: { enrollment: Enrollment; toStageId: string } | null;
  program: Program;
  onClose: () => void;
}) {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const { message } = App.useApp();
  const [note, setNote] = useState('');
  const [move, { isLoading }] = useMoveEnrollmentStageMutation();
  const to = program.stages.find((item) => item.id === target?.toStageId);

  return (
    <Modal
      open={target !== null}
      onCancel={onClose}
      afterClose={() => setNote('')}
      destroyOnHidden
      title={t('move.title')}
      okText={t('move.ok')}
      cancelText={t('cancel')}
      okButtonProps={{ loading: isLoading }}
      onOk={async () => {
        if (!target) return;
        try {
          await move({ id: target.enrollment.id, to_stage_id: target.toStageId, note }).unwrap();
          void message.success(t('move.done'));
          onClose();
        } catch {
          void message.error(t('errors.generic'));
        }
      }}
    >
      {target && to && (
        <>
          <Typography.Paragraph>
            {t('move.body', {
              name: localized(target.enrollment.patient, 'name', locale),
              stage: localized(to, 'name', locale),
            })}
          </Typography.Paragraph>
          <Form layout="vertical" component="div">
            <Form.Item label={t('move.note')}>
              <Input.TextArea
                aria-label={t('move.note')}
                rows={2}
                maxLength={300}
                showCount
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

/**
 * لوحة المرضى حسب مراحل البرنامج (D-19 · docs/20 · 5.2): عمود لكل مرحلة، وكل مريض كارت فيه أيامه في المرحلة
 * وعلامة "متأخر" لو عدّى المدة المتوقعة. النقل بالسحب من المقبض أو من "انقل إلى" (للكيبورد). التسجيل في البرنامج بصلاحية §programs.enroll§.
 */
export function ProgramsBoardPage() {
  const { t } = useTranslation('programs');
  const { t: tNav } = useTranslation('nav');
  const locale = useLocale();
  const canEnroll = useCan('programs.enroll');
  const canBuild = useCan('builders.manage');
  const { branchId } = useBranchScope();
  const [programId, setProgramId] = useState<string>();
  const [lateOnly, setLateOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [moving, setMoving] = useState<{ enrollment: Enrollment; toStageId: string } | null>(null);

  const programs = useGetProgramsQuery();
  const active = (programs.data ?? []).filter((item) => item.status === 'active');
  const selectedId = programId ?? active[0]?.id;
  const program = useGetProgramQuery(selectedId ?? '', { skip: !selectedId });
  const enrollments = useGetEnrollmentsQuery(
    { program_id: selectedId ?? '', branch_id: branchId },
    { skip: !selectedId },
  );

  const stages = program.data?.stages ?? [];
  const text = query.trim().toLowerCase();
  const all = enrollments.data ?? [];
  const lateOf = (item: Enrollment) => {
    const stage = stages.find((entry) => entry.id === item.stage_id);
    return stage ? daysLate(item, stage) : 0;
  };
  const visible = all.filter(
    (item) =>
      (!lateOnly || lateOf(item) > 0) &&
      (!text ||
        item.patient.name_ar.includes(text) ||
        item.patient.name_en.toLowerCase().includes(text) ||
        item.patient.file_no.toLowerCase().includes(text)),
  );
  const lateCount = all.filter((item) => lateOf(item) > 0).length;

  const body = () => {
    if (programs.isLoading || (selectedId && (program.isLoading || enrollments.isLoading)))
      return <LoadingState />;
    if (programs.isError || program.isError || enrollments.isError) {
      return (
        <ErrorState
          onRetry={() => {
            void programs.refetch();
            void program.refetch();
            void enrollments.refetch();
          }}
        />
      );
    }
    if (!selectedId || !program.data) {
      return (
        <EmptyState
          title={t('board.noPrograms')}
          description={t('board.noProgramsBody')}
          action={canBuild ? <Link to="/programs/builder">{t('manage.title')}</Link> : undefined}
        />
      );
    }
    const current = program.data;
    return (
      <KanbanBoard
        ariaLabel={t('board.region', { program: localized(current, 'name', locale) })}
        emptyText={t('board.emptyColumn')}
        columns={stages.map((stage) => ({
          id: stage.id,
          title: localized(stage, 'name', locale),
          subtitle: t('board.expected', { count: stage.expected_days }),
          count: visible.filter((item) => item.stage_id === stage.id).length,
        }))}
        items={visible}
        columnOf={(item) => item.stage_id}
        dragLabel={(item) => t('board.drag', { name: localized(item.patient, 'name', locale) })}
        onMove={canEnroll ? (item, toStageId) => setMoving({ enrollment: item, toStageId }) : null}
        renderCard={(item) => {
          const stage = stages.find((entry) => entry.id === item.stage_id);
          const late = stage ? daysLate(item, stage) : 0;
          return (
            <>
              <Link
                to="/patients/$patientId"
                params={{ patientId: item.patient.id }}
                style={{ fontWeight: 600 }}
              >
                {localized(item.patient, 'name', locale)}
              </Link>
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                <span dir="ltr">{item.patient.file_no}</span>
                {item.owner && ` · ${localized(item.owner, 'name', locale)}`}
              </Typography.Text>
              <Flex gap={8} wrap align="center" style={{ marginBlock: 8 }}>
                <Typography.Text>{t('board.daysIn', { count: daysInStage(item) })}</Typography.Text>
                {late > 0 && (
                  <StatusTag tone="danger">{t('board.late', { count: late })}</StatusTag>
                )}
              </Flex>
              {canEnroll && (
                <Select<string | null>
                  size="small"
                  value={null}
                  aria-label={t('board.moveTo', { name: localized(item.patient, 'name', locale) })}
                  placeholder={t('board.moveToShort')}
                  onChange={(toStageId) => toStageId && setMoving({ enrollment: item, toStageId })}
                  options={stages
                    .filter((entry) => entry.id !== item.stage_id)
                    .map((entry) => ({ value: entry.id, label: localized(entry, 'name', locale) }))}
                  style={{ width: '100%' }}
                />
              )}
            </>
          );
        }}
      />
    );
  };

  return (
    <>
      <PageHeader
        title={tNav('programs')}
        description={t('board.description')}
        extra={
          <>
            {canBuild && (
              <Link to="/programs/builder">
                <Button>{t('manage.title')}</Button>
              </Link>
            )}
            {canEnroll && program.data && branchId !== ALL_BRANCHES && (
              <Button
                type="primary"
                icon={<UserPlus size={16} aria-hidden />}
                onClick={() => setEnrolling(true)}
              >
                {t('enroll.button')}
              </Button>
            )}
          </>
        }
      />
      <Card>
        <Flex wrap gap={12} align="center" style={{ marginBottom: 16 }}>
          <Select
            aria-label={t('board.program')}
            value={selectedId}
            onChange={setProgramId}
            options={active.map((item) => ({
              value: item.id,
              label: localized(item, 'name', locale),
            }))}
            style={{ minWidth: 200 }}
          />
          <Input
            type="search"
            allowClear
            aria-label={t('board.search')}
            placeholder={t('board.search')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ flex: '1 1 220px', maxWidth: 340 }}
          />
          <Flex gap={8} align="center">
            <Switch checked={lateOnly} onChange={setLateOnly} aria-labelledby="late-label" />
            <span id="late-label">{t('board.lateOnly', { count: lateCount })}</span>
          </Flex>
          <Typography.Text type="secondary" style={{ color: tokens.color.mutedText }}>
            {t('board.total', { count: all.length })}
          </Typography.Text>
        </Flex>
        {body()}
      </Card>
      {program.data && branchId !== ALL_BRANCHES && (
        <EnrollModal
          program={program.data}
          branchId={branchId}
          open={enrolling}
          onClose={() => setEnrolling(false)}
        />
      )}
      {program.data && (
        <MoveModal target={moving} program={program.data} onClose={() => setMoving(null)} />
      )}
    </>
  );
}
