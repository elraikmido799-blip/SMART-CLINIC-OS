import { useState } from 'react';
import { Button, Card, Flex, Input, InputNumber, Select, Typography } from 'antd';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatSlot } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { ErrorState, LoadingState } from '@/components/states/states';
import { useCan } from '@/features/auth/use-me';
import { WeightChart } from '@/features/patients/components/weight-chart';
import { useGetPatientOverviewQuery } from '@/features/patients/patients.api';
import { useAutosave } from '@/lib/use-autosave';
import { useGetNutritionPlanQuery, useSaveNutritionPlanMutation } from '../nutrition-plans.api';
import {
  GOAL_TYPES,
  MEAL_SLOTS,
  type MealSlot,
  type NutritionPlan,
  type NutritionPlanBody,
} from '../types';

const bodyOf = (plan: NutritionPlan): NutritionPlanBody => ({
  patient_id: plan.patient_id,
  goal: plan.goal,
  meals: MEAL_SLOTS.map(
    (slot) => plan.meals.find((meal) => meal.slot === slot) ?? { slot, items: [] },
  ),
  notes: plan.notes,
});

// متابعة الوزن (من الـOverview، وبتتخفي من غير medical.read)
function WeightFollowUp({ patientId, target }: { patientId: string; target: number | null }) {
  const { t } = useTranslation('nutritionPlans');
  const locale = useLocale();
  const canMedical = useCan('medical.read');
  const { data } = useGetPatientOverviewQuery(patientId, { skip: !canMedical });
  const weight = data?.weight ?? [];
  if (!canMedical || weight.length < 2) return null;
  const last = weight[weight.length - 1].kg;

  return (
    <section style={{ marginBottom: 20 }}>
      <Typography.Title level={2} style={{ fontSize: 16, marginBottom: 8 }}>
        {t('followUp.title')}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {t('followUp.current', { value: formatNumber(last, locale) })}
        {target !== null &&
          ` · ${t('followUp.remaining', { value: formatNumber(Math.abs(Math.round((last - target) * 10) / 10), locale) })}`}
      </Typography.Text>
      <WeightChart points={weight} />
    </section>
  );
}

function NutritionEditor({ plan, readOnly }: { plan: NutritionPlan; readOnly: boolean }) {
  const { t } = useTranslation('nutritionPlans');
  const locale = useLocale();
  const [draft, setDraft] = useState<NutritionPlanBody>(() => bodyOf(plan));
  const [save] = useSaveNutritionPlanMutation();
  const autosave = useAutosave<NutritionPlanBody>(
    async (body) => (await save(body).unwrap()).updated_at,
    plan.updated_at,
  );

  const update = (next: NutritionPlanBody) => {
    setDraft(next);
    autosave.schedule(next);
  };

  const setItems = (
    slot: MealSlot,
    change: (
      items: NutritionPlanBody['meals'][number]['items'],
    ) => NutritionPlanBody['meals'][number]['items'],
  ) =>
    update({
      ...draft,
      meals: draft.meals.map((meal) =>
        meal.slot === slot ? { ...meal, items: change(meal.items) } : meal,
      ),
    });

  const status =
    autosave.state === 'saving'
      ? t('status.saving')
      : autosave.state === 'dirty'
        ? t('status.dirty')
        : autosave.state === 'error'
          ? t('status.error')
          : autosave.state === 'saved' && autosave.savedAt
            ? t('status.saved', { time: formatSlot(autosave.savedAt, locale).time })
            : '';

  const heading = { fontSize: 16, marginBottom: 8 } as const;

  return (
    <>
      <section style={{ marginBottom: 20 }}>
        <Typography.Title level={2} style={heading}>
          {t('goal.title')}
        </Typography.Title>
        <Flex gap={12} wrap>
          <label>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {t('goal.type')}
            </Typography.Text>
            <Select
              disabled={readOnly}
              value={draft.goal.type}
              onChange={(type) => update({ ...draft, goal: { ...draft.goal, type } })}
              options={GOAL_TYPES.map((value) => ({ value, label: t(`goal.types.${value}`) }))}
              style={{ minWidth: 160 }}
            />
          </label>
          <label>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {t('goal.targetWeight')}
            </Typography.Text>
            <InputNumber
              min={20}
              max={300}
              disabled={readOnly}
              value={draft.goal.target_weight_kg}
              onChange={(value) =>
                update({ ...draft, goal: { ...draft.goal, target_weight_kg: value } })
              }
              style={{ width: 120 }}
            />
          </label>
          <label>
            <Typography.Text type="secondary" style={{ display: 'block' }}>
              {t('goal.kcal')}
            </Typography.Text>
            <InputNumber
              min={800}
              max={6000}
              step={50}
              disabled={readOnly}
              value={draft.goal.daily_kcal}
              onChange={(value) => update({ ...draft, goal: { ...draft.goal, daily_kcal: value } })}
              style={{ width: 120 }}
            />
          </label>
        </Flex>
      </section>

      <WeightFollowUp patientId={draft.patient_id} target={draft.goal.target_weight_kg} />

      <section style={{ marginBottom: 20 }}>
        <Typography.Title level={2} style={heading}>
          {t('meals.title')}
        </Typography.Title>
        {draft.meals.map((meal) => (
          <div
            key={meal.slot}
            style={{
              border: `1px solid ${tokens.color.border}`,
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <Flex justify="space-between" align="center">
              <Typography.Text strong>{t(`meals.slots.${meal.slot}`)}</Typography.Text>
              {!readOnly && (
                <Button
                  size="small"
                  icon={<Plus size={14} aria-hidden />}
                  onClick={() =>
                    setItems(meal.slot, (items) => [
                      ...items,
                      { id: crypto.randomUUID(), text: '', alternative: '' },
                    ])
                  }
                >
                  {t('meals.addItem', { slot: t(`meals.slots.${meal.slot}`) })}
                </Button>
              )}
            </Flex>
            {meal.items.length === 0 ? (
              <Typography.Text type="secondary">{t('meals.empty')}</Typography.Text>
            ) : (
              <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                {meal.items.map((item) => (
                  <li key={item.id} style={{ marginBottom: 8 }}>
                    <Flex gap={8} align="center" wrap>
                      <Input
                        aria-label={t('meals.itemLabel', { slot: t(`meals.slots.${meal.slot}`) })}
                        placeholder={t('meals.itemPlaceholder')}
                        disabled={readOnly}
                        value={item.text}
                        onChange={(event) =>
                          setItems(meal.slot, (items) =>
                            items.map((entry) =>
                              entry.id === item.id ? { ...entry, text: event.target.value } : entry,
                            ),
                          )
                        }
                        style={{ flex: '2 1 180px' }}
                      />
                      <Input
                        aria-label={t('meals.alternativeLabel', {
                          slot: t(`meals.slots.${meal.slot}`),
                        })}
                        placeholder={t('meals.alternativePlaceholder')}
                        disabled={readOnly}
                        value={item.alternative}
                        onChange={(event) =>
                          setItems(meal.slot, (items) =>
                            items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, alternative: event.target.value }
                                : entry,
                            ),
                          )
                        }
                        style={{ flex: '1 1 140px' }}
                      />
                      {!readOnly && (
                        <Button
                          type="text"
                          size="small"
                          aria-label={t('meals.remove')}
                          icon={<X size={14} aria-hidden />}
                          onClick={() =>
                            setItems(meal.slot, (items) =>
                              items.filter((entry) => entry.id !== item.id),
                            )
                          }
                        />
                      )}
                    </Flex>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 12 }}>
        <Typography.Title level={2} style={heading}>
          {t('notes.title')}
        </Typography.Title>
        <Input.TextArea
          aria-label={t('notes.label')}
          rows={3}
          maxLength={1000}
          showCount
          disabled={readOnly}
          value={draft.notes}
          onChange={(event) => update({ ...draft, notes: event.target.value })}
        />
      </section>
      <Typography.Text type="secondary" role="status">
        {readOnly ? t('readOnly') : status}
      </Typography.Text>
    </>
  );
}

/**
 * خطة التغذية (D-12 · docs/20 · 4.6): الهدف · متابعة الوزن · الوجبات وبدايلها · ملاحظات. بتتحفظ تلقائي.
 * `readOnly` لو الكشف اتوقّع أو الموظف مش بيعدّل.
 */
export function NutritionPanel({
  patientId,
  readOnly,
  title,
}: {
  patientId: string;
  readOnly: boolean;
  title?: string;
}) {
  const { t } = useTranslation('nutritionPlans');
  const { data, isLoading, isError, refetch } = useGetNutritionPlanQuery(patientId);

  return (
    <Card title={title ?? t('title')}>
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <NutritionEditor key={data.patient_id} plan={data} readOnly={readOnly} />
      )}
    </Card>
  );
}
