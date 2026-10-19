import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Steps,
  Typography,
} from 'antd';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { directionOf, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useCan } from '@/features/auth/use-me';
import { apiErrorCode } from '@/lib/api-error';
import { move } from '@/lib/list';
import {
  useCreateProgramMutation,
  useGetProgramQuery,
  useUpdateProgramMutation,
} from '../programs.api';
import { PROGRAM_STATUSES, type ProgramBody, type ProgramStage } from '../types';

const newStage = (): ProgramStage => ({
  id: `stage-${crypto.randomUUID().slice(0, 8)}`,
  name_ar: '',
  name_en: '',
  expected_days: 14,
  goal_ar: '',
  goal_en: '',
  exit_ar: '',
  exit_en: '',
});

const EMPTY: ProgramBody = {
  code: '',
  name_ar: '',
  name_en: '',
  status: 'draft',
  stages: [newStage()],
};

const CODE = /^[a-z][a-z0-9_]{1,40}$/;

type Issue = 'name' | 'code' | 'noStages' | 'stageName' | 'stageDays';

function issuesOf(program: ProgramBody): Issue[] {
  const issues = new Set<Issue>();
  if (!program.name_ar.trim() || !program.name_en.trim()) issues.add('name');
  if (!CODE.test(program.code)) issues.add('code');
  if (program.stages.length === 0) issues.add('noStages');
  for (const stage of program.stages) {
    if (!stage.name_ar.trim() || !stage.name_en.trim()) issues.add('stageName');
    if (!(stage.expected_days >= 1)) issues.add('stageDays');
  }
  return [...issues];
}

function Builder({ id, initial }: { id: string; initial: ProgramBody }) {
  const { t } = useTranslation('programs');
  const locale = useLocale();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const canBuild = useCan('builders.manage');
  const [program, setProgram] = useState(initial);
  const [shown, setShown] = useState(false);
  const [create, createState] = useCreateProgramMutation();
  const [update, updateState] = useUpdateProgramMutation();
  const Back = directionOf(locale) === 'rtl' ? ArrowRight : ArrowLeft;
  const isNew = id === 'new';
  const issues = issuesOf(program);
  const readOnly = !canBuild;

  const patchStage = (stageId: string, patch: Partial<ProgramStage>) =>
    setProgram((current) => ({
      ...current,
      stages: current.stages.map((item) => (item.id === stageId ? { ...item, ...patch } : item)),
    }));

  const save = async () => {
    setShown(true);
    if (issues.length) return;
    try {
      if (isNew) {
        const created = await create(program).unwrap();
        void message.success(t('builder.saved'));
        await navigate({ to: '/programs/builder/$id', params: { id: created.id }, replace: true });
      } else {
        await update({ id, ...program }).unwrap();
        void message.success(t('builder.saved'));
      }
    } catch (error) {
      const code = apiErrorCode(error as never);
      void message.error(code === 'CODE_TAKEN' ? t('errors.CODE_TAKEN') : t('errors.generic'));
    }
  };

  return (
    <>
      <PageHeader
        title={
          isNew
            ? t('builder.newTitle')
            : localized(program, 'name', locale) || t('builder.newTitle')
        }
        description={t('builder.description')}
        extra={
          <>
            <Button
              icon={<Back size={16} aria-hidden />}
              onClick={() => void navigate({ to: '/programs/builder' })}
            >
              {t('builder.back')}
            </Button>
            {canBuild && (
              <Button
                type="primary"
                loading={createState.isLoading || updateState.isLoading}
                onClick={() => void save()}
              >
                {t('builder.save')}
              </Button>
            )}
          </>
        }
      />
      {shown && issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          title={t('issues.title')}
          description={
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>
              {issues.map((issue) => (
                <li key={issue}>{t(`issues.${issue}`)}</li>
              ))}
            </ul>
          }
        />
      )}
      <Card title={t('builder.details')} style={{ marginBottom: 16 }}>
        <Form layout="vertical" component="div">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label={t('builder.nameAr')} required>
                <Input
                  aria-label={t('builder.nameAr')}
                  disabled={readOnly}
                  value={program.name_ar}
                  onChange={(event) => setProgram({ ...program, name_ar: event.target.value })}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={t('builder.nameEn')} required>
                <Input
                  dir="ltr"
                  aria-label={t('builder.nameEn')}
                  disabled={readOnly}
                  value={program.name_en}
                  onChange={(event) => setProgram({ ...program, name_en: event.target.value })}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item
                label={t('builder.code')}
                extra={isNew ? t('builder.codeHelp') : undefined}
                required
              >
                <Input
                  dir="ltr"
                  aria-label={t('builder.code')}
                  disabled={readOnly || !isNew}
                  value={program.code}
                  onChange={(event) => setProgram({ ...program, code: event.target.value })}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label={t('builder.status')}>
                <Select
                  aria-label={t('builder.status')}
                  disabled={readOnly}
                  value={program.status}
                  onChange={(status) => setProgram({ ...program, status })}
                  options={PROGRAM_STATUSES.map((value) => ({
                    value,
                    label: t(`statuses.${value}`),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title={t('builder.journey')} style={{ marginBottom: 16 }}>
        {program.stages.length === 0 ? (
          <EmptyState title={t('builder.noStages')} />
        ) : (
          <Steps
            size="small"
            current={-1}
            responsive
            items={program.stages.map((stage) => ({
              title: localized(stage, 'name', locale) || t('builder.unnamed'),
              content: t('builder.days', { count: stage.expected_days }),
            }))}
          />
        )}
      </Card>

      <Typography.Title level={2} style={{ fontSize: 18 }}>
        {t('builder.stagesTitle')}
      </Typography.Title>
      {program.stages.map((stage, index) => (
        <Card
          key={stage.id}
          style={{ marginBottom: 12 }}
          title={t('builder.stageN', { n: index + 1 })}
          extra={
            !readOnly && (
              <Flex gap={4}>
                <Button
                  type="text"
                  size="small"
                  aria-label={t('builder.stageUp', { n: index + 1 })}
                  icon={<ArrowUp size={14} aria-hidden />}
                  disabled={index === 0}
                  onClick={() =>
                    setProgram({ ...program, stages: move(program.stages, index, -1) })
                  }
                />
                <Button
                  type="text"
                  size="small"
                  aria-label={t('builder.stageDown', { n: index + 1 })}
                  icon={<ArrowDown size={14} aria-hidden />}
                  disabled={index === program.stages.length - 1}
                  onClick={() => setProgram({ ...program, stages: move(program.stages, index, 1) })}
                />
                <Button
                  type="text"
                  size="small"
                  aria-label={t('builder.stageRemove', { n: index + 1 })}
                  icon={<Trash2 size={14} aria-hidden />}
                  onClick={() =>
                    setProgram({
                      ...program,
                      stages: program.stages.filter((item) => item.id !== stage.id),
                    })
                  }
                />
              </Flex>
            )
          }
        >
          <Form layout="vertical" component="div">
            <Row gutter={16}>
              <Col xs={24} md={9}>
                <Form.Item label={t('builder.stageNameAr')} required>
                  <Input
                    aria-label={t('builder.stageNameAr') + ` ${index + 1}`}
                    disabled={readOnly}
                    value={stage.name_ar}
                    onChange={(event) => patchStage(stage.id, { name_ar: event.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={9}>
                <Form.Item label={t('builder.stageNameEn')} required>
                  <Input
                    dir="ltr"
                    aria-label={t('builder.stageNameEn') + ` ${index + 1}`}
                    disabled={readOnly}
                    value={stage.name_en}
                    onChange={(event) => patchStage(stage.id, { name_en: event.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label={t('builder.expectedDays')}
                  required
                  extra={t('builder.expectedDaysHelp')}
                >
                  <InputNumber
                    aria-label={t('builder.expectedDays') + ` ${index + 1}`}
                    min={1}
                    max={730}
                    disabled={readOnly}
                    value={stage.expected_days}
                    onChange={(value) => patchStage(stage.id, { expected_days: value ?? 0 })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={t('builder.goalAr')}>
                  <Input.TextArea
                    aria-label={t('builder.goalAr') + ` ${index + 1}`}
                    rows={2}
                    disabled={readOnly}
                    value={stage.goal_ar}
                    onChange={(event) => patchStage(stage.id, { goal_ar: event.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={t('builder.goalEn')}>
                  <Input.TextArea
                    dir="ltr"
                    aria-label={t('builder.goalEn') + ` ${index + 1}`}
                    rows={2}
                    disabled={readOnly}
                    value={stage.goal_en}
                    onChange={(event) => patchStage(stage.id, { goal_en: event.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={t('builder.exitAr')}>
                  <Input
                    aria-label={t('builder.exitAr') + ` ${index + 1}`}
                    disabled={readOnly}
                    value={stage.exit_ar}
                    onChange={(event) => patchStage(stage.id, { exit_ar: event.target.value })}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={t('builder.exitEn')}>
                  <Input
                    dir="ltr"
                    aria-label={t('builder.exitEn') + ` ${index + 1}`}
                    disabled={readOnly}
                    value={stage.exit_en}
                    onChange={(event) => patchStage(stage.id, { exit_en: event.target.value })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      ))}
      {!readOnly && (
        <Button
          icon={<Plus size={14} aria-hidden />}
          onClick={() => setProgram({ ...program, stages: [...program.stages, newStage()] })}
          style={{ borderColor: tokens.color.border }}
        >
          {t('builder.addStage')}
        </Button>
      )}
    </>
  );
}

/** بنّاء البرنامج (D-18 · docs/20 · 5.1): البيانات الأساسية · الرحلة (المراحل بترتيبها) · كل مرحلة بمدتها وهدفها وشرط خروجها */
export function ProgramBuilderPage() {
  const { t } = useTranslation('programs');
  const { id } = useParams({ from: '/_app/programs/builder/$id' });
  const isNew = id === 'new';
  const { data, isLoading, isError, error, refetch } = useGetProgramQuery(id, { skip: isNew });

  if (isNew) return <Builder key="new" id="new" initial={EMPTY} />;
  if (isLoading) return <LoadingState />;
  if (isError || !data) {
    const status = !!error && 'status' in error ? error.status : null;
    return (
      <Card>
        {status === 404 ? (
          <EmptyState level={1} title={t('notFound.title')} description={t('notFound.body')} />
        ) : (
          <ErrorState level={1} onRetry={() => void refetch()} />
        )}
      </Card>
    );
  }
  const body: ProgramBody = {
    code: data.code,
    name_ar: data.name_ar,
    name_en: data.name_en,
    status: data.status,
    stages: data.stages,
  };
  return <Builder key={data.id} id={id} initial={body} />;
}
