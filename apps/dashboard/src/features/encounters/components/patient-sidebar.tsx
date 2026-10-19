import { Card, Divider, Flex, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PersonAvatar } from '@/components/person-avatar';
import { clinicToday } from '@/lib/clinic-time';
import { ageOf } from '@/features/patients/age';
import type { Encounter } from '../types';

/** عمود المريض في الكشف (D-11): الاسم · الملف · التشخيص · الجلسة · آخر الملاحظات */
export function PatientSidebar({ encounter }: { encounter: Encounter }) {
  const { t } = useTranslation('encounters');
  const { t: tPatients } = useTranslation('patients');
  const locale = useLocale();
  const { patient } = encounter;
  const name = localized(patient, 'name', locale);
  const diagnosis = locale === 'ar' ? patient.diagnosis_ar : patient.diagnosis_en;
  const facts = [
    tPatients(`file.${patient.gender}`),
    patient.birth_date
      ? tPatients('file.age', { age: ageOf(patient.birth_date, clinicToday()) })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card>
      <Flex gap={12} align="center">
        <PersonAvatar name={name} size={52} />
        <div>
          <Typography.Title level={2} style={{ margin: 0, fontSize: 20 }}>
            {name}
          </Typography.Title>
          <Typography.Text type="secondary">{facts}</Typography.Text>
        </div>
      </Flex>
      <Divider style={{ marginBlock: 16 }} />
      <dl style={{ margin: 0 }}>
        <dt>
          <Typography.Text type="secondary">{t('patient.file')}</Typography.Text>
        </dt>
        <dd style={{ margin: '0 0 12px', fontWeight: 600 }} dir="ltr">
          <span style={{ display: 'block', textAlign: 'start' }}>{patient.file_no}</span>
        </dd>
        {diagnosis && (
          <>
            <dt>
              <Typography.Text type="secondary">{t('patient.diagnosis')}</Typography.Text>
            </dt>
            <dd style={{ margin: '0 0 12px', fontWeight: 600 }}>{diagnosis}</dd>
          </>
        )}
        {patient.session_number !== null && patient.session_total !== null && (
          <>
            <dt>
              <Typography.Text type="secondary">{t('patient.session')}</Typography.Text>
            </dt>
            <dd style={{ margin: 0 }}>
              <Typography.Text strong>
                {t('patient.sessionOf', {
                  number: patient.session_number,
                  total: patient.session_total,
                })}
              </Typography.Text>
              <Progress
                percent={Math.round((patient.session_number / patient.session_total) * 100)}
                showInfo={false}
                size="small"
                aria-label={t('patient.session')}
              />
            </dd>
          </>
        )}
      </dl>
      <Divider style={{ marginBlock: 16 }} />
      <Typography.Title level={2} style={{ fontSize: 16 }}>
        {t('patient.recentNotes')}
      </Typography.Title>
      {encounter.recent_notes.length === 0 ? (
        <Typography.Text type="secondary">{t('patient.noNotes')}</Typography.Text>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {encounter.recent_notes.map((note) => (
            <li key={note.id} style={{ marginBottom: 14 }}>
              <Typography.Text strong>
                {note.session !== null
                  ? t('patient.sessionN', { number: note.session })
                  : t('patient.visit')}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                {formatDate(note.date, locale)}
              </Typography.Text>
              <div>{note.text}</div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
