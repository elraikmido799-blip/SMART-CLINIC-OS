import { useEffect, useState } from 'react';
import { Button, Card, Flex, Tabs } from 'antd';
import { CalendarPlus, Wallet } from 'lucide-react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatMoney, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { PersonAvatar } from '@/components/person-avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useGetPractitionersQuery } from '@/features/appointments/appointments.api';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { hasAny, useCan, useMe } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { clinicToday } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { useGetPatientOverviewQuery, useGetPatientQuery } from '../patients.api';
import { ageOf } from '../age';
import { rememberPatient } from '../recent';
import { PATIENT_TABS, type PatientTab } from '../tabs';
import { DermPanel } from '@/features/derm-plans/components/derm-panel';
import { NutritionPanel } from '@/features/nutrition-plans/components/nutrition-panel';
import { PlanPanel } from '@/features/care-plans/components/plan-panel';
import { EncountersTab } from '@/features/encounters/components/encounters-tab';
import { MeasurementsTab } from '@/features/measurements/components/measurements-tab';
import { ProgramsTab } from '@/features/programs/components/programs-tab';
import { PatientBillingTab } from '@/features/billing/components/patient-billing-tab';
import { RelatedTasks } from '@/features/tasks/components/related-tasks';
import { DocumentsTab } from './documents-tab';
import { OverviewTab } from './overview-tab';

/**
 * ملف المريض 360 (D-09 · docs/20 · 4.1): الهيدر (الاسم · الملف · السن · الموبايل · الفرع) + التنبيهات
 * (البرنامج والمرحلة · الحساسية · الجلسات الباقية · الرصيد) + "احجز" + "تحصيل"، وتحته التابات حسب الصلاحية.
 * التاب المفتوح في `?tab=`. أي فتحة للملف بتدخل "آخر مرضى اتفتحوا".
 */
export function PatientPage() {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const me = useMe();
  const { patientId } = useParams({ from: '/_app/patients/$patientId' });
  const { tab = 'overview' } = useSearch({ from: '/_app/patients/$patientId' });
  const navigate = useNavigate();
  const { branchId, branches } = useBranchScope();
  const canBook = useCan('appointments.write');
  const canCollect = useCan('billing.collect');
  const [booking, setBooking] = useState<BookingMode | null>(null);
  const { data: patient, isLoading, isError, error, refetch } = useGetPatientQuery(patientId);
  const overview = useGetPatientOverviewQuery(patientId, { skip: !patient });
  const today = clinicToday();
  const scoped = branchId !== ALL_BRANCHES;
  const practitioners = useGetPractitionersQuery(
    { branch_id: branchId, from: today, to: today },
    { skip: !scoped || !canBook },
  );

  useEffect(() => {
    if (patient) rememberPatient(patient);
  }, [patient]);

  if (isLoading) return <LoadingState />;
  if (isError || !patient) {
    const notFound = !!error && 'status' in error && error.status === 404;
    return notFound ? (
      <Card>
        <EmptyState
          level={1}
          title={t('file.notFoundTitle')}
          description={t('file.notFoundBody')}
        />
      </Card>
    ) : (
      <Card>
        <ErrorState level={1} onRetry={() => void refetch()} />
      </Card>
    );
  }

  const name = localized(patient, 'name', locale);
  const branch = branches.find((item) => item.id === patient.branch_id);
  const alerts = overview.data?.alerts;
  const tabs = PATIENT_TABS.filter((item) => hasAny(me, [item.permission]));
  // تاب في اللينك مش من صلاحيتك ← الـOverview
  const active: PatientTab = tabs.some((item) => item.key === tab) ? tab : 'overview';
  const facts = [
    <span key="file" dir="ltr">
      {patient.file_no}
    </span>,
    patient.birth_date ? t('file.age', { age: ageOf(patient.birth_date, today) }) : null,
    t(`file.${patient.gender}`),
    <span key="phone" dir="ltr">
      {formatEgyptianMobile(patient.phone)}
    </span>,
    branch ? localized(branch, 'name', locale) : null,
  ].filter(Boolean);

  const badges = [
    alerts?.program && (
      <StatusTag key="program" tone="primary">
        {t('file.program', {
          name: localized(alerts.program, 'name', locale),
          stage: alerts.program.stage,
        })}
      </StatusTag>
    ),
    ...(alerts?.allergies ?? []).map((allergy) => (
      <StatusTag key={`allergy-${allergy.name_en}`} tone="danger">
        {t('file.allergy', { name: localized(allergy, 'name', locale) })}
      </StatusTag>
    )),
    alerts?.sessions_left != null && (
      <StatusTag key="sessions" tone="info">
        {t('file.sessionsLeft', { count: alerts.sessions_left })}
      </StatusTag>
    ),
    patient.balance_due > 0 && (
      <StatusTag key="balance" tone="warning">
        {t('details.balanceDue', {
          ns: 'appointments',
          amount: formatMoney(patient.balance_due, 'EGP', locale),
        })}
      </StatusTag>
    ),
  ].filter(Boolean);

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Flex gap={16} align="flex-start" wrap>
          <PersonAvatar name={name} size={64} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <PageHeader
              title={name}
              description={
                <Flex wrap gap={8} align="center" component="span">
                  {facts.map((fact, index) => (
                    <span key={index}>
                      {index > 0 && <span aria-hidden> · </span>}
                      {fact}
                    </span>
                  ))}
                </Flex>
              }
              extra={
                <Flex gap={8} wrap>
                  {canCollect && (
                    <Button
                      icon={<Wallet size={16} aria-hidden />}
                      onClick={() =>
                        void navigate({ to: '/front-desk/pos', search: { patient: patient.id } })
                      }
                    >
                      {t('file.collect')}
                    </Button>
                  )}
                  {canBook && scoped && (
                    <Button
                      type="primary"
                      icon={<CalendarPlus size={16} aria-hidden />}
                      onClick={() => setBooking({ kind: 'new', date: today, patient })}
                    >
                      {t('file.book')}
                    </Button>
                  )}
                </Flex>
              }
            />
            {badges.length > 0 && (
              <Flex wrap gap={8} aria-label={t('file.alerts')} role="group">
                {badges}
              </Flex>
            )}
          </div>
        </Flex>
      </Card>
      <Tabs
        activeKey={active}
        onChange={(key) =>
          void navigate({
            to: '/patients/$patientId',
            params: { patientId },
            search: { tab: key === 'overview' ? undefined : (key as PatientTab) },
            replace: true,
          })
        }
        items={tabs.map((item) => ({
          key: item.key,
          label: t(`tabs.${item.key}`),
          children:
            item.key === 'encounters' ? (
              <EncountersTab patientId={patientId} />
            ) : item.key === 'programs' ? (
              <ProgramsTab patientId={patientId} branchId={patient.branch_id} />
            ) : item.key === 'billing' ? (
              <PatientBillingTab patientId={patientId} />
            ) : item.key === 'crm' ? (
              <RelatedTasks type="patient" id={patientId} branchId={patient.branch_id} />
            ) : item.key === 'measurements' ? (
              <MeasurementsTab patientId={patientId} />
            ) : item.key === 'documents' ? (
              <DocumentsTab patientId={patientId} />
            ) : item.key === 'plans' ? (
              <Flex vertical gap={16}>
                <PlanPanel patientId={patientId} readOnly title={t('plans.physio')} />
                <NutritionPanel patientId={patientId} readOnly title={t('plans.nutrition')} />
                <DermPanel patientId={patientId} readOnly title={t('plans.derm')} />
              </Flex>
            ) : item.key === 'overview' ? (
              <OverviewTab
                overview={overview.data}
                isLoading={overview.isLoading}
                isError={overview.isError}
                onRetry={() => void overview.refetch()}
              />
            ) : (
              <Card>
                <EmptyState
                  title={tCommon('states.comingSoonTitle')}
                  description={
                    item.step ? tCommon('states.comingSoonBody', { step: item.step }) : undefined
                  }
                />
              </Card>
            ),
        }))}
      />
      <BookingModal
        mode={booking}
        branchId={branchId}
        practitioners={practitioners.data ?? []}
        onClose={() => setBooking(null)}
      />
    </>
  );
}
