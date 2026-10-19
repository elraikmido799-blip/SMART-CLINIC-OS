import { useEffect, useState } from 'react';
import { Button, Card, Flex } from 'antd';
import { CalendarPlus } from 'lucide-react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatEgyptianMobile, formatMoney, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { PersonAvatar } from '@/components/person-avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { StatusTag } from '@/components/tags';
import { useGetPractitionersQuery } from '@/features/appointments/appointments.api';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { useCan } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { clinicToday } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { useGetPatientQuery } from '../patients.api';
import { rememberPatient } from '../recent';

// العمر بالسنين من تاريخ الميلاد
function ageOf(birthDate: string, today: string) {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/**
 * ملف المريض (بداية D-09): الهيدر (الاسم · الملف · السن · الموبايل · الفرع · الفلوس المتأخرة) + "احجز".
 * التابات والملف كامل في docs/20 · 4.1. أي فتحة للملف بتدخل "آخر مرضى اتفتحوا".
 */
export function PatientPage() {
  const { t } = useTranslation('patients');
  const locale = useLocale();
  const { patientId } = useParams({ from: '/_app/patients/$patientId' });
  const { branchId, branches } = useBranchScope();
  const canBook = useCan('appointments.write');
  const [booking, setBooking] = useState<BookingMode | null>(null);
  const { data: patient, isLoading, isError, error, refetch } = useGetPatientQuery(patientId);
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

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
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
                canBook && scoped ? (
                  <Button
                    type="primary"
                    icon={<CalendarPlus size={16} aria-hidden />}
                    onClick={() => setBooking({ kind: 'new', date: today, patient })}
                  >
                    {t('file.book')}
                  </Button>
                ) : undefined
              }
            />
            {patient.balance_due > 0 && (
              <StatusTag tone="warning">
                {t('details.balanceDue', {
                  ns: 'appointments',
                  amount: formatMoney(patient.balance_due, 'EGP', locale),
                })}
              </StatusTag>
            )}
          </div>
        </Flex>
      </Card>
      <Card>
        <EmptyState title={t('file.comingSoon')} />
      </Card>
      <BookingModal
        mode={booking}
        branchId={branchId}
        practitioners={practitioners.data ?? []}
        onClose={() => setBooking(null)}
      />
    </>
  );
}
