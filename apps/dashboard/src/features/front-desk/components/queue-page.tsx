import { useState } from 'react';
import { Button, Card, Flex, Input, Select } from 'antd';
import { Search, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatWeekday, localized, normalizeEgyptianMobile } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/states';
import {
  useGetAppointmentsQuery,
  useGetPractitionersQuery,
} from '@/features/appointments/appointments.api';
import { AppointmentPanel } from '@/features/appointments/components/appointment-panel';
import { BookingModal, type BookingMode } from '@/features/appointments/components/booking-modal';
import { SLOT_MIN } from '@/features/appointments/grid';
import type { Appointment } from '@/features/appointments/types';
import { useClinicClock } from '@/features/appointments/use-clinic-clock';
import { useCan } from '@/features/auth/use-me';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { QueueBoard } from './queue-board';

const POLL = { pollingInterval: 30_000, skipPollingIfUnfocused: true };

// الاسم أو الموبايل أو رقم الملف
function matches(item: Appointment, query: string) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const phone = normalizeEgyptianMobile(text);
  const { patient } = item;
  return (
    patient.name_ar.includes(text) ||
    patient.name_en.toLowerCase().includes(text) ||
    patient.file_no.toLowerCase().includes(text) ||
    (phone !== null && patient.phone === phone)
  );
}

/**
 * الاستقبال: طابور النهارده (D-05 · docs/20 · 3.4) — صفحة "الاستقبال" والرئيسية بتاعة المساعد.
 * فلتر الدكتور · البحث في الطابور · "مريض من غير ميعاد" (حجز دلوقتي).
 */
export function QueuePage() {
  const { t } = useTranslation('frontDesk');
  const locale = useLocale();
  const { branchId } = useBranchScope();
  const { today, minutes } = useClinicClock();
  const canBook = useCan('appointments.write');
  const [practitionerId, setPractitionerId] = useState<string>();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [booking, setBooking] = useState<BookingMode | null>(null);

  const scoped = branchId !== ALL_BRANCHES;
  const range = { branch_id: branchId, from: today, to: today };
  const practitioners = useGetPractitionersQuery(range, { skip: !scoped });
  const appointments = useGetAppointmentsQuery(range, { skip: !scoped, ...POLL });
  const team = practitioners.data ?? [];
  const list = (appointments.data ?? []).filter(
    (item) => (!practitionerId || item.practitioner_id === practitionerId) && matches(item, query),
  );

  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  // أقرب ربع ساعة جاية (للمريض اللي جه من غير ميعاد)
  const nextSlot = Math.ceil(minutes / SLOT_MIN) * SLOT_MIN;

  return (
    <>
      <PageHeader
        title={t('queue.title')}
        description={`${formatWeekday(weekday, locale)} · ${formatDate(today, locale)}`}
        extra={
          canBook && scoped ? (
            <Button
              type="primary"
              icon={<UserPlus size={16} aria-hidden />}
              onClick={() =>
                setBooking({ kind: 'new', date: today, minutes: nextSlot, practitionerId })
              }
            >
              {t('queue.walkIn')}
            </Button>
          ) : undefined
        }
      />
      {!scoped ? (
        <Card>
          <EmptyState title={t('pickBranch.title')} description={t('pickBranch.body')} />
        </Card>
      ) : (
        <Card>
          <Flex wrap gap={12} style={{ marginBottom: 16 }}>
            <Input
              type="search"
              allowClear
              aria-label={t('queue.search')}
              placeholder={t('queue.search')}
              prefix={<Search size={16} color={tokens.color.mutedText} aria-hidden />}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ flex: '1 1 280px', maxWidth: 420 }}
            />
            <Select
              allowClear
              aria-label={t('queue.allPractitioners')}
              placeholder={t('queue.allPractitioners')}
              value={practitionerId}
              onChange={setPractitionerId}
              options={team.map((item) => ({
                value: item.id,
                label: localized(item, 'name', locale),
              }))}
              style={{ minWidth: 200 }}
            />
          </Flex>
          {appointments.isLoading || practitioners.isLoading ? (
            <LoadingState />
          ) : appointments.isError ? (
            <ErrorState onRetry={() => void appointments.refetch()} />
          ) : (
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
          )}
        </Card>
      )}
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
