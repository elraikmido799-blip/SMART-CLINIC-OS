import { useState } from 'react';
import { Button, Card, Col, Row, Segmented, Table } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { formatDate, formatSlot, localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import { SpecialtyTag, StatusTag } from '@/components/tags';
import { useGetAppointmentsQuery } from '@/features/appointments/appointments.api';
import { STATUS_TONE } from '@/features/appointments/status';
import type { Appointment, AppointmentStatus } from '@/features/appointments/types';
import { useClinicClock } from '@/features/appointments/use-clinic-clock';
import { useCan, useMe } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { useVisitActions } from '@/features/front-desk/use-visit-actions';
import { clinicMinutes } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { NextPatientCard } from './next-patient-card';
import { PendingCard } from './pending-card';

const POLL = { pollingInterval: 30_000, skipPollingIfUnfocused: true };
const FILTERS = ['all', 'waiting', 'with_me', 'done'] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_STATUSES: Record<Exclude<Filter, 'all'>, AppointmentStatus[]> = {
  waiting: ['confirmed', 'checked_in'],
  with_me: ['in_progress'],
  done: ['completed', 'no_show'],
};

/**
 * يوم الدكتور (D-10 · docs/20 · 4.2): الرئيسية بتاعة الدكتور والأخصائي. طابور النهارده بتاعي بس +
 * المريض الجاي + "مستني منك". "ابدأ كشف" بيدخّل المريض (شاشة الكشف نفسها في 4.3).
 */
export function DoctorDayPage() {
  const { t } = useTranslation('doctorDay');
  const { t: tAppointments } = useTranslation('appointments');
  const locale = useLocale();
  const me = useMe();
  const navigate = useNavigate();
  const { branchId } = useBranchScope();
  const { today, minutes } = useClinicClock();
  const canStart = useCan('medical.write', 'physio.write', 'nutrition.write', 'derm_im.write');
  const { start, pendingId } = useVisitActions();
  const [filter, setFilter] = useState<Filter>('all');

  const scoped = branchId !== ALL_BRANCHES;
  const { data, isLoading, isError, refetch } = useGetAppointmentsQuery(
    { branch_id: branchId, from: today, to: today },
    { skip: !scoped, ...POLL },
  );

  const mine = (data ?? [])
    .filter((item) => item.practitioner_id === me.id && item.status !== 'cancelled')
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const rows =
    filter === 'all' ? mine : mine.filter((item) => FILTER_STATUSES[filter].includes(item.status));

  // اللي وصل الأول (حسب وقت الوصول)، وإلا أقرب ميعاد لسه جاي
  const next: Appointment | null =
    mine
      .filter((item) => item.status === 'checked_in')
      .sort((a, b) => (a.checked_in_at ?? '').localeCompare(b.checked_in_at ?? ''))[0] ??
    mine.find((item) => item.status === 'confirmed' && clinicMinutes(item.starts_at) >= minutes) ??
    null;
  const nextIn = next ? clinicMinutes(next.starts_at) - minutes : null;

  const description = [
    t('count', { count: mine.length }),
    next && nextIn !== null && nextIn > 0 ? t('nextIn', { minutes: nextIn }) : null,
    formatDate(today, locale),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <PageHeader
        title={t('greeting', { name: localized(me, 'name', locale) })}
        description={description}
      />
      {!scoped ? (
        <Card>
          <EmptyState title={t('pickBranch.title')} description={t('pickBranch.body')} />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card
              title={t('queue.title')}
              extra={
                <Segmented
                  aria-label={t('queue.filter')}
                  value={filter}
                  onChange={setFilter}
                  options={FILTERS.map((value) => ({ value, label: t(`queue.filters.${value}`) }))}
                />
              }
            >
              {isLoading ? (
                <LoadingState />
              ) : isError ? (
                <ErrorState onRetry={() => void refetch()} />
              ) : (
                <Table<Appointment>
                  rowKey="id"
                  dataSource={rows}
                  pagination={false}
                  scroll={{ x: 640 }}
                  locale={{ emptyText: <EmptyState title={t('queue.empty')} /> }}
                  columns={[
                    {
                      title: t('queue.time'),
                      dataIndex: 'starts_at',
                      render: (value: string) => formatSlot(value, locale).time,
                    },
                    {
                      title: t('queue.patient'),
                      render: (_, item) => (
                        <>
                          <div style={{ fontWeight: 600 }}>
                            {localized(item.patient, 'name', locale)}
                          </div>
                          <span dir="ltr">{item.patient.file_no}</span>
                        </>
                      ),
                    },
                    {
                      title: t('queue.service'),
                      render: (_, item) => (
                        <>
                          <SpecialtyTag specialty={item.service.specialty} />
                          <div>{localized(item.service, 'name', locale)}</div>
                        </>
                      ),
                    },
                    {
                      title: t('queue.status'),
                      render: (_, item) => (
                        <StatusTag tone={STATUS_TONE[item.status]}>
                          {tAppointments(`status.${item.status}`)}
                        </StatusTag>
                      ),
                    },
                    {
                      title: t('queue.actions'),
                      render: (_, item) => (
                        <>
                          {canStart && item.status === 'checked_in' && (
                            <Button
                              size="small"
                              loading={pendingId === item.id}
                              onClick={() => void start(item)}
                              style={{ marginInlineEnd: 8 }}
                            >
                              {t('startEncounter')}
                            </Button>
                          )}
                          <Button
                            size="small"
                            onClick={() =>
                              void navigate({
                                to: '/patients/$patientId',
                                params: { patientId: item.patient.id },
                              })
                            }
                          >
                            {t('view')}
                          </Button>
                        </>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <NextPatientCard
                  appointment={next}
                  nowMinutes={minutes}
                  canStart={canStart}
                  starting={pendingId === next?.id}
                  onStart={(item) => void start(item)}
                />
              </Col>
              <Col span={24}>
                <PendingCard />
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
}
