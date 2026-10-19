import { useState } from 'react';
import { App, Button, Card, DatePicker, Flex, Segmented, Select, Typography } from 'antd';
import { CalendarPlus, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatDate, formatDayParts, formatTime, formatWeekday, localized } from '@oxygen/shared';
import { SPECIALTIES } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import {
  useDeleteTimeBlockMutation,
  useGetAppointmentsQuery,
  useGetPractitionersQuery,
  useGetRoomsQuery,
  useGetTimeBlocksQuery,
  useRescheduleAppointmentMutation,
} from '@/features/appointments/appointments.api';
import { AppointmentPanel } from '@/features/appointments/components/appointment-panel';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { TimeGrid, type GridColumn } from '@/features/appointments/components/time-grid';
import { calendarErrorKey } from '@/features/appointments/errors';
import { toHHmm } from '@/features/appointments/grid';
import type { Appointment, TimeBlock } from '@/features/appointments/types';
import { useClinicClock } from '@/features/appointments/use-clinic-clock';
import { useCan } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { addDays, clinicDateOf, clinicIso, clinicMinutes, weekStart } from '@/lib/clinic-time';
import { ALL_BRANCHES } from '@/store/ui-slice';
import type { CalendarSearch } from '../search';
import { BlockTimeModal } from './block-time-modal';

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

/**
 * الكالندر (D-03 · docs/20 · 3.2): يوم أو أسبوع · بالدكتور أو بالأوضة · فلاتر التخصص والدكتور.
 * الحجز بدوسة على مكان فاضي أو "حجز جديد" · التأجيل بالسحب (أو من التفاصيل) · قفل وقت.
 * الحالة كلها في الـURL.
 */
export function CalendarPage() {
  const { t } = useTranslation('calendar');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const { modal, message } = App.useApp();
  const search = useSearch({ from: '/_app/calendar' });
  const navigate = useNavigate({ from: '/calendar' });
  const { branchId } = useBranchScope();
  const { today, minutes: nowMinutes } = useClinicClock();
  const canWrite = useCan('appointments.write');

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [booking, setBooking] = useState<BookingMode | null>(null);
  const [blocking, setBlocking] = useState<{ practitionerId?: string; date: string } | null>(null);
  const [reschedule] = useRescheduleAppointmentMutation();
  const [deleteBlock] = useDeleteTimeBlockMutation();

  const date = search.date ?? today;
  const view = search.view ?? 'day';
  const group = view === 'week' ? 'practitioner' : (search.group ?? 'practitioner');
  const days =
    view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(weekStart(date), i)) : [date];

  const scoped = branchId !== ALL_BRANCHES;
  const range = { branch_id: branchId, from: days[0], to: days[days.length - 1] };
  const practitionersQuery = useGetPractitionersQuery(range, { skip: !scoped });
  const appointmentsQuery = useGetAppointmentsQuery(range, { skip: !scoped });
  const blocksQuery = useGetTimeBlocksQuery(range, { skip: !scoped });
  const roomsQuery = useGetRoomsQuery(
    { branch_id: branchId },
    { skip: !scoped || group !== 'room' },
  );

  const update = (patch: Partial<CalendarSearch>) =>
    navigate({ search: (previous) => ({ ...previous, ...patch }), replace: true });

  const allPractitioners = practitionersQuery.data ?? [];
  const bySpecialty = allPractitioners.filter(
    (item) => !search.specialty || item.specialty === search.specialty,
  );
  // الأسبوع لدكتور واحد (أول واحد لو محدش متختار)
  const weekPractitioner =
    bySpecialty.find((item) => item.id === search.practitioner) ?? bySpecialty[0];
  const shown =
    view === 'week'
      ? weekPractitioner
        ? [weekPractitioner]
        : []
      : bySpecialty.filter((item) => !search.practitioner || item.id === search.practitioner);
  const shownIds = new Set(shown.map((item) => item.id));

  const appointments = (appointmentsQuery.data ?? []).filter((item) =>
    shownIds.has(item.practitioner_id),
  );
  const blocks = (blocksQuery.data ?? []).filter((block) => shownIds.has(block.practitioner_id));

  let columns: GridColumn[];
  let columnOf: (item: Appointment) => string;
  let blockColumnOf: ((block: TimeBlock) => string | null) | undefined;

  if (view === 'week') {
    columns = days.map((day) => {
      const parts = formatDayParts(day, locale);
      return { id: day, title: parts.weekday, subtitle: parts.day, isToday: day === today };
    });
    columnOf = (item) => clinicDateOf(item.starts_at);
    blockColumnOf = (block) => clinicDateOf(block.starts_at);
  } else if (group === 'room') {
    columns = (roomsQuery.data ?? []).map((room) => ({
      id: room.id,
      title: localized(room, 'name', locale),
      isToday: date === today,
    }));
    columnOf = (item) => item.room_id;
  } else {
    columns = shown.map((item) => ({
      id: item.id,
      title: localized(item, 'name', locale),
      subtitle: tCommon(`specialties.${item.specialty}`),
      specialty: item.specialty,
      isToday: date === today,
    }));
    columnOf = (item) => item.practitioner_id;
    blockColumnOf = (block) => block.practitioner_id;
  }

  // الدوسة على مكان فاضي: الدكتور واليوم من العمود
  const slotTarget = (columnId: string) => ({
    practitionerId:
      view === 'week' ? weekPractitioner?.id : group === 'room' ? undefined : columnId,
    date: view === 'week' ? columnId : date,
  });

  const canDrag = (item: Appointment) => {
    if (item.status !== 'confirmed') return false;
    const day = clinicDateOf(item.starts_at);
    return day > today || (day === today && clinicMinutes(item.starts_at) > nowMinutes);
  };

  const confirmMove = (item: Appointment, columnId: string, minutes: number) => {
    const target = slotTarget(columnId);
    const practitionerId = target.practitionerId ?? item.practitioner_id;
    const practitioner = allPractitioners.find((entry) => entry.id === practitionerId);
    // التأجيل لدكتور من نفس التخصص بس (الخدمة مرتبطة بالتخصص)
    if (practitioner && practitioner.specialty !== item.service.specialty) {
      void message.error(t('errors.SLOT_TAKEN'));
      return;
    }
    void modal.confirm({
      title: t('move.title'),
      content: t('move.body', {
        patient: localized(item.patient, 'name', locale),
        day: formatDate(target.date, locale),
        time: formatTime(toHHmm(minutes), locale),
        practitioner: practitioner ? localized(practitioner, 'name', locale) : '',
      }),
      okText: t('move.confirm'),
      cancelText: tCommon('actions.cancel'),
      onOk: async () => {
        try {
          await reschedule({
            id: item.id,
            starts_at: clinicIso(target.date, minutes),
            practitioner_id: practitionerId,
          }).unwrap();
          void message.success(t('booking.rescheduled'));
        } catch (error) {
          void message.error(t(calendarErrorKey(error)));
        }
      },
    });
  };

  const confirmUnblock = (block: TimeBlock) => {
    void modal.confirm({
      title: t('block.unblockTitle'),
      content: t('block.unblockBody', {
        reason: t(`block.reasons.${block.reason}`),
        time: `${formatTime(toHHmm(clinicMinutes(block.starts_at)), locale)} – ${formatTime(toHHmm(clinicMinutes(block.ends_at)), locale)}`,
      }),
      okText: t('block.unblock'),
      cancelText: tCommon('actions.cancel'),
      onOk: async () => {
        try {
          await deleteBlock({ id: block.id }).unwrap();
          void message.success(t('block.unblocked'));
        } catch (error) {
          void message.error(t(calendarErrorKey(error)));
        }
      },
    });
  };

  const step = view === 'week' ? 7 : 1;
  const title =
    view === 'week'
      ? `${formatDate(days[0], locale)} – ${formatDate(days[6], locale)}`
      : `${formatWeekday(weekdayOf(date), locale)} · ${formatDate(date, locale)}`;
  const isLoading = practitionersQuery.isLoading || appointmentsQuery.isLoading;
  const isError = practitionersQuery.isError || appointmentsQuery.isError;
  const isRtl = locale === 'ar';
  // في العربي "اللي قبل" سهمه لليمين
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <>
      <PageHeader
        title={t('title')}
        description={title}
        extra={
          canWrite && scoped ? (
            <>
              <Button icon={<Lock size={16} aria-hidden />} onClick={() => setBlocking({ date })}>
                {t('toolbar.blockTime')}
              </Button>
              <Button
                type="primary"
                icon={<CalendarPlus size={16} aria-hidden />}
                onClick={() => setBooking({ kind: 'new', date: date < today ? today : date })}
              >
                {t('toolbar.newBooking')}
              </Button>
            </>
          ) : undefined
        }
      />

      {!scoped ? (
        <Card>
          <EmptyState
            title={t('pickBranch.title', { ns: 'frontDesk' })}
            description={t('pickBranch.body', { ns: 'frontDesk' })}
          />
        </Card>
      ) : (
        <Card styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: 16 } }}>
          <Flex
            wrap
            gap={12}
            align="center"
            style={{ padding: 16, borderBottom: '1px solid var(--ant-color-border-secondary)' }}
          >
            <Flex gap={4}>
              <Button
                aria-label={t('toolbar.previous')}
                icon={<PrevIcon size={18} aria-hidden />}
                onClick={() => update({ date: addDays(date, -step) })}
              />
              <Button onClick={() => update({ date: undefined })}>{t('toolbar.today')}</Button>
              <Button
                aria-label={t('toolbar.next')}
                icon={<NextIcon size={18} aria-hidden />}
                onClick={() => update({ date: addDays(date, step) })}
              />
            </Flex>
            <DatePicker
              aria-label={t('toolbar.date')}
              value={dayjs(date)}
              allowClear={false}
              format="D MMMM YYYY"
              onChange={(value) => value && update({ date: value.format('YYYY-MM-DD') })}
            />
            <Segmented
              aria-label={t('toolbar.view')}
              value={view}
              onChange={(value) => update({ view: value === 'week' ? 'week' : undefined })}
              options={[
                { value: 'day', label: t('toolbar.day') },
                { value: 'week', label: t('toolbar.week') },
              ]}
            />
            {view === 'day' && (
              <Segmented
                aria-label={t('toolbar.group')}
                value={group}
                onChange={(value) => update({ group: value === 'room' ? 'room' : undefined })}
                options={[
                  { value: 'practitioner', label: t('toolbar.byPractitioner') },
                  { value: 'room', label: t('toolbar.byRoom') },
                ]}
              />
            )}
            <Select
              aria-label={t('toolbar.specialty')}
              allowClear
              placeholder={t('toolbar.allSpecialties')}
              value={search.specialty}
              onChange={(value) => update({ specialty: value, practitioner: undefined })}
              options={SPECIALTIES.map((value) => ({
                value,
                label: tCommon(`specialties.${value}`),
              }))}
              style={{ minWidth: 160 }}
            />
            <Select
              aria-label={t('toolbar.practitioner')}
              allowClear={view === 'day'}
              placeholder={t('toolbar.allPractitioners')}
              value={view === 'week' ? weekPractitioner?.id : search.practitioner}
              onChange={(value) => update({ practitioner: value })}
              options={bySpecialty.map((item) => ({
                value: item.id,
                label: localized(item, 'name', locale),
              }))}
              style={{ minWidth: 180 }}
            />
          </Flex>
          {canWrite && group === 'practitioner' && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0, padding: '8px 16px', fontSize: 13 }}
            >
              {t('toolbar.dragHint')}
            </Typography.Paragraph>
          )}
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              onRetry={() => {
                void practitionersQuery.refetch();
                void appointmentsQuery.refetch();
              }}
            />
          ) : columns.length === 0 ? (
            <EmptyState title={t('grid.noPractitioners', { ns: 'appointments' })} />
          ) : (
            <TimeGrid
              key={`${view}-${group}-${days[0]}`}
              columns={columns}
              appointments={appointments}
              columnOf={columnOf}
              timeBlocks={blocks}
              blockColumnOf={blockColumnOf}
              nowMinutes={nowMinutes}
              onSelect={setSelected}
              onBlockSelect={canWrite ? confirmUnblock : undefined}
              onSlotClick={
                canWrite
                  ? (columnId, minutes) => {
                      const target = slotTarget(columnId);
                      if (target.date < today) return;
                      setBooking({ kind: 'new', ...target, minutes });
                    }
                  : undefined
              }
              canDrag={canDrag}
              onMove={canWrite && group === 'practitioner' ? confirmMove : undefined}
              maxHeight="calc(100dvh - 330px)"
              minColumnWidth={view === 'week' ? 140 : 180}
            />
          )}
        </Card>
      )}

      <AppointmentPanel
        appointment={selected}
        practitioners={allPractitioners}
        branchId={branchId}
        onClose={() => setSelected(null)}
      />
      <BookingModal
        mode={booking}
        branchId={branchId}
        practitioners={allPractitioners}
        onClose={() => setBooking(null)}
      />
      <BlockTimeModal
        open={blocking}
        branchId={branchId}
        practitioners={allPractitioners}
        onClose={() => setBlocking(null)}
      />
    </>
  );
}
