import { useEffect, useRef, useState } from 'react';
import { Button, Card, Checkbox, Flex, Input, InputNumber, Modal, Select, Typography } from 'antd';
import { Dumbbell, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { useGetExercisesQuery } from '@/features/exercises/exercises.api';
import { EXERCISE_REGIONS, type Exercise, type ExerciseRegion } from '@/features/exercises/types';
import { useGetCarePlanQuery, useSaveCarePlanMutation } from '../care-plans.api';
import type { CarePlan, CarePlanBody } from '../types';

// الخطة بتتحفظ بعد ما الدكتور يبطّل تعديل بالمدة دي (زي المسودة في الكشف)
const AUTOSAVE_MS = 1500;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const bodyOf = (plan: CarePlan): CarePlanBody => ({
  patient_id: plan.patient_id,
  goals: plan.goals,
  sessions_per_week: plan.sessions_per_week,
  total_sessions: plan.total_sessions,
  exercises: plan.exercises,
});

// اختيار تمرين من المكتبة (التمارين المفعّلة بس)
function LibraryModal({
  open,
  taken,
  onPick,
  onClose,
}: {
  open: boolean;
  taken: Set<string>;
  onPick: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('carePlans');
  const { t: tExercises } = useTranslation('exercises');
  const locale = useLocale();
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<ExerciseRegion>();
  const { data, isLoading, isError, refetch } = useGetExercisesQuery(
    { q: q.trim() || undefined, region },
    { skip: !open },
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      title={t('library.title')}
      width={560}
    >
      <Flex gap={8} wrap style={{ marginBottom: 12 }}>
        <Input
          type="search"
          allowClear
          aria-label={t('library.search')}
          placeholder={t('library.search')}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          style={{ flex: '1 1 200px' }}
        />
        <Select
          allowClear
          aria-label={t('library.region')}
          placeholder={t('library.region')}
          value={region}
          onChange={setRegion}
          options={EXERCISE_REGIONS.map((value) => ({
            value,
            label: tExercises(`regions.${value}`),
          }))}
          style={{ minWidth: 150 }}
        />
      </Flex>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <EmptyState title={t('library.none')} />
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 360, overflow: 'auto' }}>
          {data.map((exercise) => (
            <li
              key={exercise.id}
              style={{ borderBlockEnd: `1px solid ${tokens.color.border}`, padding: '10px 0' }}
            >
              <Flex gap={12} align="center" justify="space-between">
                <div>
                  <Typography.Text strong>{localized(exercise, 'name', locale)}</Typography.Text>
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {tExercises(`regions.${exercise.region}`)}
                  </Typography.Text>
                </div>
                <Button
                  size="small"
                  disabled={taken.has(exercise.id)}
                  onClick={() => onPick(exercise)}
                >
                  {taken.has(exercise.id) ? t('library.added') : t('library.add')}
                </Button>
              </Flex>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function PlanEditor({ plan, readOnly }: { plan: CarePlan; readOnly: boolean }) {
  const { t } = useTranslation('carePlans');
  const locale = useLocale();
  const [draft, setDraft] = useState<CarePlanBody>(() => bodyOf(plan));
  const [goalText, setGoalText] = useState('');
  const [picking, setPicking] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState(plan.updated_at);
  const [save] = useSaveCarePlanMutation();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exercises = useGetExercisesQuery({ include_inactive: true });

  useEffect(() => () => clearTimeout(timer.current), []);

  const persist = async (body: CarePlanBody) => {
    setSaveState('saving');
    try {
      const saved = await save(body).unwrap();
      setSavedAt(saved.updated_at);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const update = (next: CarePlanBody) => {
    setDraft(next);
    setSaveState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(next), AUTOSAVE_MS);
  };

  const addGoal = () => {
    const text = goalText.trim();
    if (!text) return;
    update({
      ...draft,
      goals: [...draft.goals, { id: crypto.randomUUID(), text, achieved: false }],
    });
    setGoalText('');
  };

  const nameOf = (id: string) => {
    const found = exercises.data?.find((item) => item.id === id);
    return found ? localized(found, 'name', locale) : id;
  };
  const inactive = (id: string) => exercises.data?.find((item) => item.id === id)?.active === false;

  const status =
    saveState === 'saving'
      ? t('status.saving')
      : saveState === 'dirty'
        ? t('status.dirty')
        : saveState === 'error'
          ? t('status.error')
          : saveState === 'saved' && savedAt
            ? t('status.saved', { time: formatSlot(savedAt, locale).time })
            : '';

  const section = { marginBottom: 20 } as const;
  const heading = { fontSize: 16, marginBottom: 8 } as const;

  return (
    <>
      <section style={section}>
        <Typography.Title level={2} style={heading}>
          {t('goals.title')}
        </Typography.Title>
        {draft.goals.length === 0 ? (
          <Typography.Text type="secondary">{t('goals.none')}</Typography.Text>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {draft.goals.map((goal) => (
              <li key={goal.id} style={{ paddingBlock: 4 }}>
                <Flex gap={8} align="flex-start" justify="space-between">
                  <Checkbox
                    checked={goal.achieved}
                    disabled={readOnly}
                    onChange={(event) =>
                      update({
                        ...draft,
                        goals: draft.goals.map((item) =>
                          item.id === goal.id ? { ...item, achieved: event.target.checked } : item,
                        ),
                      })
                    }
                  >
                    <span style={{ textDecoration: goal.achieved ? 'line-through' : undefined }}>
                      {goal.text}
                    </span>
                  </Checkbox>
                  {!readOnly && (
                    <Button
                      type="text"
                      size="small"
                      aria-label={t('goals.remove', { text: goal.text })}
                      icon={<X size={14} aria-hidden />}
                      onClick={() =>
                        update({
                          ...draft,
                          goals: draft.goals.filter((item) => item.id !== goal.id),
                        })
                      }
                    />
                  )}
                </Flex>
              </li>
            ))}
          </ul>
        )}
        {!readOnly && (
          <Flex gap={8} style={{ marginTop: 8 }}>
            <Input
              aria-label={t('goals.placeholder')}
              placeholder={t('goals.placeholder')}
              value={goalText}
              onChange={(event) => setGoalText(event.target.value)}
              onPressEnter={addGoal}
            />
            <Button onClick={addGoal}>{t('goals.add')}</Button>
          </Flex>
        )}
      </section>

      <section style={section}>
        <Typography.Title level={2} style={heading}>
          {t('sessions.title')}
        </Typography.Title>
        <Flex gap={16} wrap align="center">
          <label>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {t('sessions.perWeek')}
            </Typography.Text>
            <InputNumber
              min={1}
              max={7}
              disabled={readOnly}
              value={draft.sessions_per_week}
              onChange={(value) => value !== null && update({ ...draft, sessions_per_week: value })}
            />
          </label>
          <label>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {t('sessions.total')}
            </Typography.Text>
            <InputNumber
              min={1}
              max={100}
              disabled={readOnly}
              value={draft.total_sessions}
              onChange={(value) => value !== null && update({ ...draft, total_sessions: value })}
            />
          </label>
        </Flex>
      </section>

      <section style={section}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Typography.Title level={2} style={{ ...heading, marginBottom: 0 }}>
            {t('exercises.title')}
          </Typography.Title>
          {!readOnly && (
            <Button
              size="small"
              icon={<Plus size={14} aria-hidden />}
              onClick={() => setPicking(true)}
            >
              {t('exercises.add')}
            </Button>
          )}
        </Flex>
        {draft.exercises.length === 0 ? (
          <Typography.Text type="secondary">{t('exercises.empty')}</Typography.Text>
        ) : (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {draft.exercises.map((item, index) => (
              <li
                key={item.exercise_id}
                style={{
                  border: `1px solid ${tokens.color.border}`,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Flex justify="space-between" align="center" gap={8}>
                  <Flex gap={8} align="center">
                    <Dumbbell size={18} color={tokens.color.primary} aria-hidden />
                    <Typography.Text strong>
                      {index + 1}. {nameOf(item.exercise_id)}
                    </Typography.Text>
                    {inactive(item.exercise_id) && (
                      <Typography.Text type="secondary">{t('exercises.inactive')}</Typography.Text>
                    )}
                  </Flex>
                  {!readOnly && (
                    <Button
                      type="text"
                      size="small"
                      aria-label={t('exercises.remove', { name: nameOf(item.exercise_id) })}
                      icon={<X size={14} aria-hidden />}
                      onClick={() =>
                        update({
                          ...draft,
                          exercises: draft.exercises.filter(
                            (entry) => entry.exercise_id !== item.exercise_id,
                          ),
                        })
                      }
                    />
                  )}
                </Flex>
                <Flex gap={16} style={{ marginTop: 8 }}>
                  {(['sets', 'reps'] as const).map((field) => (
                    <label key={field}>
                      <Typography.Text type="secondary" style={{ display: 'block' }}>
                        {t(`exercises.${field}`)}
                      </Typography.Text>
                      <InputNumber
                        min={1}
                        max={100}
                        disabled={readOnly}
                        value={item[field]}
                        onChange={(value) =>
                          value !== null &&
                          update({
                            ...draft,
                            exercises: draft.exercises.map((entry) =>
                              entry.exercise_id === item.exercise_id
                                ? { ...entry, [field]: value }
                                : entry,
                            ),
                          })
                        }
                        style={{ width: 90 }}
                      />
                    </label>
                  ))}
                </Flex>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Typography.Text type="secondary" role="status">
        {readOnly ? t('readOnly') : status}
      </Typography.Text>
      <LibraryModal
        open={picking}
        taken={new Set(draft.exercises.map((item) => item.exercise_id))}
        onClose={() => setPicking(false)}
        onPick={(exercise) =>
          update({
            ...draft,
            exercises: [...draft.exercises, { exercise_id: exercise.id, sets: 3, reps: 10 }],
          })
        }
      />
    </>
  );
}

/**
 * خطة العلاج الطبيعي (D-13 · docs/20 · 4.4): الأهداف · الجلسات · التمارين البيتية من المكتبة.
 * بتتحفظ تلقائي. `readOnly` لو الكشف اتوقّع أو الموظف مش من اللي بيعدّلوا.
 */
export function PlanPanel({
  patientId,
  readOnly,
  title,
}: {
  patientId: string;
  readOnly: boolean;
  title?: string;
}) {
  const { t } = useTranslation('carePlans');
  const { data, isLoading, isError, refetch } = useGetCarePlanQuery(patientId);

  return (
    <Card title={title ?? t('title')}>
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        // key = المريض: خطة كل مريض بقيمها هي
        <PlanEditor key={data.patient_id} plan={data} readOnly={readOnly} />
      )}
    </Card>
  );
}
