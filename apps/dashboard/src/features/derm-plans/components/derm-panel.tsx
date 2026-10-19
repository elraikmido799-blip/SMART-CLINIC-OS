import { useState } from 'react';
import { Button, Card, Flex, Input, InputNumber, Typography } from 'antd';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSlot } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { ErrorState, LoadingState } from '@/components/states/states';
import { useAutosave } from '@/lib/use-autosave';
import { useGetDermPlanQuery, useSaveDermPlanMutation } from '../derm-plans.api';
import type { DermPlan, DermPlanBody } from '../types';

function DermEditor({ plan, readOnly }: { plan: DermPlan; readOnly: boolean }) {
  const { t } = useTranslation('dermPlans');
  const locale = useLocale();
  const [draft, setDraft] = useState<DermPlanBody>(() => ({
    patient_id: plan.patient_id,
    procedures: plan.procedures,
    notes: plan.notes,
  }));
  const [save] = useSaveDermPlanMutation();
  const autosave = useAutosave<DermPlanBody>(
    async (body) => (await save(body).unwrap()).updated_at,
    plan.updated_at,
  );

  const update = (next: DermPlanBody) => {
    setDraft(next);
    autosave.schedule(next);
  };

  const change = (id: string, patch: Partial<DermPlanBody['procedures'][number]>) =>
    update({
      ...draft,
      procedures: draft.procedures.map((item) => (item.id === id ? { ...item, ...patch } : item)),
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

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Title level={2} style={{ fontSize: 16, margin: 0 }}>
          {t('procedures.title')}
        </Typography.Title>
        {!readOnly && (
          <Button
            size="small"
            icon={<Plus size={14} aria-hidden />}
            onClick={() =>
              update({
                ...draft,
                procedures: [
                  ...draft.procedures,
                  { id: crypto.randomUUID(), name: '', sessions_total: 4, sessions_done: 0 },
                ],
              })
            }
          >
            {t('procedures.add')}
          </Button>
        )}
      </Flex>
      {draft.procedures.length === 0 ? (
        <Typography.Paragraph type="secondary">{t('procedures.empty')}</Typography.Paragraph>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {draft.procedures.map((item, index) => (
            <li
              key={item.id}
              style={{
                border: `1px solid ${tokens.color.border}`,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Flex gap={8} align="center">
                <Input
                  aria-label={t('procedures.name', { n: index + 1 })}
                  placeholder={t('procedures.namePlaceholder')}
                  disabled={readOnly}
                  value={item.name}
                  onChange={(event) => change(item.id, { name: event.target.value })}
                />
                {!readOnly && (
                  <Button
                    type="text"
                    size="small"
                    aria-label={t('procedures.remove', { n: index + 1 })}
                    icon={<X size={14} aria-hidden />}
                    onClick={() =>
                      update({
                        ...draft,
                        procedures: draft.procedures.filter((entry) => entry.id !== item.id),
                      })
                    }
                  />
                )}
              </Flex>
              <Flex gap={16} style={{ marginTop: 8 }} wrap>
                <label>
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {t('procedures.done')}
                  </Typography.Text>
                  <InputNumber
                    min={0}
                    max={item.sessions_total}
                    disabled={readOnly}
                    value={item.sessions_done}
                    onChange={(value) =>
                      value !== null && change(item.id, { sessions_done: value })
                    }
                    style={{ width: 90 }}
                  />
                </label>
                <label>
                  <Typography.Text type="secondary" style={{ display: 'block' }}>
                    {t('procedures.total')}
                  </Typography.Text>
                  <InputNumber
                    min={1}
                    max={50}
                    disabled={readOnly}
                    value={item.sessions_total}
                    onChange={(value) =>
                      value !== null &&
                      change(item.id, {
                        sessions_total: value,
                        sessions_done: Math.min(item.sessions_done, value),
                      })
                    }
                    style={{ width: 90 }}
                  />
                </label>
              </Flex>
            </li>
          ))}
        </ul>
      )}
      <Typography.Title level={2} style={{ fontSize: 16, marginBlock: 16 }}>
        {t('notes.title')}
      </Typography.Title>
      <Input.TextArea
        aria-label={t('notes.title')}
        rows={3}
        maxLength={1000}
        showCount
        disabled={readOnly}
        value={draft.notes}
        onChange={(event) => update({ ...draft, notes: event.target.value })}
      />
      <Typography.Text type="secondary" role="status" style={{ display: 'block', marginTop: 8 }}>
        {readOnly ? t('readOnly') : status}
      </Typography.Text>
    </>
  );
}

/** خطة العلاج الجلدي (D-14 · docs/20 · 4.7): الإجراءات وجلساتها + ملاحظات. بتتحفظ تلقائي */
export function DermPanel({
  patientId,
  readOnly,
  title,
}: {
  patientId: string;
  readOnly: boolean;
  title?: string;
}) {
  const { t } = useTranslation('dermPlans');
  const { data, isLoading, isError, refetch } = useGetDermPlanQuery(patientId);

  return (
    <Card title={title ?? t('title')}>
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <DermEditor key={data.patient_id} plan={data} readOnly={readOnly} />
      )}
    </Card>
  );
}
