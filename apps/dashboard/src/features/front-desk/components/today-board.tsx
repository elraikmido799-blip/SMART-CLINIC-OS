import { useState } from 'react';
import { Card, Col, Flex, Row, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatDate, formatWeekday, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import {
  useGetAppointmentsQuery,
  useGetPractitionersQuery,
} from '@/features/appointments/appointments.api';
import { AppointmentPanel } from '@/features/appointments/components/appointment-panel';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { TimeGrid } from '@/features/appointments/components/time-grid';
import type { Appointment } from '@/features/appointments/types';
import { useClinicClock } from '@/features/appointments/use-clinic-clock';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { arrivingSoon } from '../arriving';
import { useGetFrontDeskSummaryQuery } from '../front-desk.api';
import { ArrivingNow } from './arriving-now';
import { QueueBoard } from './queue-board';
import { QuickActions } from './quick-actions';
import { TodayStats } from './today-stats';

// الداتا بتتحدّث لوحدها كل دقيقة (حد سجّل وصول من جهاز تاني، أو الحالات اتغيرت)
const POLL = { pollingInterval: 60_000, skipPollingIfUnfocused: true };

/**
 * شاشة اليوم بتاعة الريسبشن (D-02 · docs/20 · 3.1) — زي D-02-reception.png:
 * أرقام اليوم · كالندر اليوم (عمود لكل دكتور) · واصلين دلوقتي · إجراءات سريعة.
 */
export function TodayBoard() {
  const { t } = useTranslation('frontDesk');
  const { t: tAppointments } = useTranslation('appointments');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const { today, minutes } = useClinicClock();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [booking, setBooking] = useState<BookingMode | null>(null);
  // الكالندر (عمود لكل دكتور) أو الطابور (عمود لكل حالة — 05 §3)
  const [view, setView] = useState<'calendar' | 'queue'>('calendar');

  const scoped = branchId !== ALL_BRANCHES;
  const range = { branch_id: branchId, from: today, to: today };
  const practitioners = useGetPractitionersQuery(range, { skip: !scoped });
  const appointments = useGetAppointmentsQuery(range, { skip: !scoped, ...POLL });
  const summary = useGetFrontDeskSummaryQuery(
    { branch_id: branchId, date: today },
    { skip: !scoped, ...POLL },
  );

  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const header = (
    <PageHeader
      title={t('today.title')}
      description={`${formatWeekday(weekday, locale)} · ${formatDate(today, locale)}`}
      extra={
        scoped ? (
          <Segmented
            aria-label={t('queue.views.label')}
            value={view}
            onChange={setView}
            options={[
              { value: 'calendar', label: t('queue.views.calendar') },
              { value: 'queue', label: t('queue.views.queue') },
            ]}
          />
        ) : undefined
      }
    />
  );

  // "كل الفروع": الشاشة دي لفرع واحد
  if (!scoped) {
    return (
      <>
        {header}
        <Card>
          <EmptyState title={t('pickBranch.title')} description={t('pickBranch.body')} />
        </Card>
      </>
    );
  }

  const list = appointments.data ?? [];
  const team = practitioners.data ?? [];
  const isLoading = practitioners.isLoading || appointments.isLoading;
  const isError = practitioners.isError || appointments.isError;

  return (
    <>
      {header}
      <TodayStats summary={summary.data} />
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={18}>
          <Card
            styles={{
              body: { padding: view === 'queue' ? 16 : 0, overflow: 'hidden', borderRadius: 16 },
            }}
          >
            {isLoading ? (
              <LoadingState />
            ) : isError ? (
              <ErrorState
                onRetry={() => {
                  void practitioners.refetch();
                  void appointments.refetch();
                }}
              />
            ) : team.length === 0 ? (
              <EmptyState title={tAppointments('grid.noPractitioners')} />
            ) : view === 'queue' ? (
              <QueueBoard
                appointments={list}
                practitioners={team}
                nowMinutes={minutes}
                onSelect={setSelected}
                onRebook={(item) =>
                  setBooking({
                    kind: 'new',
                    date: today,
                    practitionerId: item.practitioner_id,
                    patient: item.patient,
                  })
                }
              />
            ) : (
              <TimeGrid
                columns={team.map((practitioner) => ({
                  id: practitioner.id,
                  title: localized(practitioner, 'name', locale),
                  subtitle: tCommon(`specialties.${practitioner.specialty}`),
                  specialty: practitioner.specialty,
                  isToday: true,
                }))}
                appointments={list}
                columnOf={(item) => item.practitioner_id}
                nowMinutes={minutes}
                onSelect={setSelected}
                maxHeight="calc(100dvh - 300px)"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Flex vertical gap={24}>
            <ArrivingNow appointments={arrivingSoon(list, minutes)} practitioners={team} />
            <QuickActions branchId={branchId} practitioners={team} />
          </Flex>
        </Col>
      </Row>
      <AppointmentPanel
        appointment={selected}
        practitioners={team}
        branchId={branchId}
        onClose={() => setSelected(null)}
      />
      <BookingModal
        mode={booking}
        branchId={branchId}
        practitioners={team}
        onClose={() => setBooking(null)}
      />
    </>
  );
}
