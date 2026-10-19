import { useState } from 'react';
import { Button, Card, Checkbox, Flex, Input, Typography } from 'antd';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSlot } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { ErrorState, LoadingState } from '@/components/states/states';
import { useAutosave } from '@/lib/use-autosave';
import { useGetMedicationsQuery, useSaveMedicationsMutation } from '../measurements.api';
import type { Medications, MedicationsBody } from '../types';

function MedicationsEditor({ record, readOnly }: { record: Medications; readOnly: boolean }) {
  const { t } = useTranslation('measurements');
  const locale = useLocale();
  const [draft, setDraft] = useState<MedicationsBody>(() => ({
    patient_id: record.patient_id,
    medications: record.medications,
  }));
  const [save] = useSaveMedicationsMutation();
  const autosave = useAutosave<MedicationsBody>(
    async (body) => (await save(body).unwrap()).updated_at,
    record.updated_at,
  );

  const update = (next: MedicationsBody) => {
    setDraft(next);
    autosave.schedule(next);
  };

  const change = (id: string, patch: Partial<MedicationsBody['medications'][number]>) =>
    update({
      ...draft,
      medications: draft.medications.map((item) => (item.id === id ? { ...item, ...patch } : item)),
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
      {draft.medications.length === 0 ? (
        <Typography.Paragraph type="secondary">{t('medications.empty')}</Typography.Paragraph>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {draft.medications.map((item, index) => (
            <li
              key={item.id}
              style={{
                border: `1px solid ${tokens.color.border}`,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Flex gap={8} wrap align="center">
                <Input
                  aria-label={t('medications.name', { n: index + 1 })}
                  placeholder={t('medications.namePlaceholder')}
                  disabled={readOnly}
                  value={item.name}
                  onChange={(event) => change(item.id, { name: event.target.value })}
                  style={{ flex: '2 1 160px' }}
                />
                <Input
                  aria-label={t('medications.dose', { n: index + 1 })}
                  placeholder={t('medications.dosePlaceholder')}
                  disabled={readOnly}
                  value={item.dose}
                  onChange={(event) => change(item.id, { dose: event.target.value })}
                  style={{ flex: '1 1 100px' }}
                />
                <Input
                  aria-label={t('medications.frequency', { n: index + 1 })}
                  placeholder={t('medications.frequencyPlaceholder')}
                  disabled={readOnly}
                  value={item.frequency}
                  onChange={(event) => change(item.id, { frequency: event.target.value })}
                  style={{ flex: '1 1 120px' }}
                />
                <Checkbox
                  checked={item.active}
                  disabled={readOnly}
                  onChange={(event) => change(item.id, { active: event.target.checked })}
                >
                  {t('medications.active')}
                </Checkbox>
                {!readOnly && (
                  <Button
                    type="text"
                    size="small"
                    aria-label={t('medications.remove', { n: index + 1 })}
                    icon={<X size={14} aria-hidden />}
                    onClick={() =>
                      update({
                        ...draft,
                        medications: draft.medications.filter((entry) => entry.id !== item.id),
                      })
                    }
                  />
                )}
              </Flex>
            </li>
          ))}
        </ul>
      )}
      <Flex justify="space-between" align="center" gap={8} wrap>
        <Typography.Text type="secondary" role="status">
          {readOnly ? t('readOnly') : status}
        </Typography.Text>
        {!readOnly && (
          <Button
            icon={<Plus size={14} aria-hidden />}
            onClick={() =>
              update({
                ...draft,
                medications: [
                  ...draft.medications,
                  { id: crypto.randomUUID(), name: '', dose: '', frequency: '', active: true },
                ],
              })
            }
          >
            {t('medications.add')}
          </Button>
        )}
      </Flex>
    </>
  );
}

/** الأدوية (D-15 · docs/20 · 4.8): الاسم والجرعة والتكرار وشغال/موقوف. بتتحفظ تلقائي */
export function MedicationsPanel({
  patientId,
  readOnly,
  title,
}: {
  patientId: string;
  readOnly: boolean;
  title?: string;
}) {
  const { t } = useTranslation('measurements');
  const { data, isLoading, isError, refetch } = useGetMedicationsQuery(patientId);

  return (
    <Card title={title ?? t('medications.title')}>
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <MedicationsEditor key={data.patient_id} record={data} readOnly={readOnly} />
      )}
    </Card>
  );
}
