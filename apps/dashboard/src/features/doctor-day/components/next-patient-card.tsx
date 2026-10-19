import { Button, Card, Flex, Typography } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { EmptyState } from '@/components/states/states';
import { PersonAvatar } from '@/components/person-avatar';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { STATUS_TONE } from '@/features/appointments/status';
import type { Appointment } from '@/features/appointments/types';
import { useCan } from '@/features/auth/use-me';
import { useGetPatientOverviewQuery } from '@/features/patients/patients.api';
import { clinicMinutes } from '@/lib/clinic-time';

type Props = {
  appointment: Appointment | null;
  nowMinutes: number;
  canStart: boolean;
  starting: boolean;
  onStart: (appointment: Appointment) => void;
};

/** المريض الجاي (D-10): الأول اللي وصل، وإلا أقرب ميعاد. التنبيهات الطبية بصلاحية medical.read بس */
export function NextPatientCard({ appointment, nowMinutes, canStart, starting, onStart }: Props) {
  const { t } = useTranslation('doctorDay');
  const { t: tAppointments } = useTranslation('appointments');
  const locale = useLocale();
  const navigate = useNavigate();
  const canMedical = useCan('medical.read');
  const overview = useGetPatientOverviewQuery(appointment?.patient.id ?? '', {
    skip: !appointment || !canMedical,
  });

  if (!appointment) {
    return (
      <Card title={t('next.title')}>
        <EmptyState title={t('next.none')} />
      </Card>
    );
  }

  const { patient } = appointment;
  const name = localized(patient, 'name', locale);
  const minutes = clinicMinutes(appointment.starts_at) - nowMinutes;
  const alerts = overview.data?.alerts;
  const waiting = appointment.status === 'checked_in';

  return (
    <Card
      title={t('next.title')}
      extra={
        <StatusTag tone={STATUS_TONE[appointment.status]}>
          {waiting
            ? tAppointments('status.checked_in')
            : minutes > 0
              ? t('next.inMinutes', { minutes })
              : t('next.now')}
        </StatusTag>
      }
    >
      <Flex gap={16} align="center">
        <PersonAvatar name={name} size={56} />
        <div>
          <Typography.Title level={2} style={{ margin: 0, fontSize: 20 }}>
            {name}
          </Typography.Title>
          <Typography.Text type="secondary">
            <span dir="ltr">{patient.file_no}</span> ·{' '}
            <span dir="ltr">{formatEgyptianMobile(patient.phone)}</span>
          </Typography.Text>
        </div>
      </Flex>
      <Flex gap={8} wrap style={{ marginTop: 16 }}>
        <SpecialtyTag specialty={appointment.service.specialty} />
        <StatusTag tone="neutral">{formatSlot(appointment.starts_at, locale).time}</StatusTag>
        {alerts?.program && (
          <StatusTag tone="primary">
            {t('next.program', {
              name: localized(alerts.program, 'name', locale),
              stage: alerts.program.stage,
            })}
          </StatusTag>
        )}
        {alerts?.allergies.map((allergy) => (
          <StatusTag key={allergy.name_en} tone="danger">
            {t('next.allergy', { name: localized(allergy, 'name', locale) })}
          </StatusTag>
        ))}
      </Flex>
      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Typography.Text strong>{t('next.service')}: </Typography.Text>
        {localized(appointment.service, 'name', locale)}
      </Typography.Paragraph>
      <Flex gap={8} wrap style={{ marginTop: 20 }}>
        {canStart && (waiting || appointment.status === 'in_progress') && (
          <Button type="primary" loading={starting} onClick={() => onStart(appointment)}>
            {waiting ? t('startEncounter') : t('continueEncounter')}
          </Button>
        )}
        <Button
          onClick={() =>
            void navigate({ to: '/patients/$patientId', params: { patientId: patient.id } })
          }
        >
          {t('openFile')}
        </Button>
      </Flex>
    </Card>
  );
}
