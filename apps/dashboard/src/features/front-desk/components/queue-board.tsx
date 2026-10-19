import { Badge, Button, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { StatusTag } from '@/components/tags';
import type { Tone } from '@/app/tones';
import type { Appointment, AppointmentStatus, Practitioner } from '@/features/appointments/types';
import { useCan } from '@/features/auth/use-me';
import { clinicMinutes } from '@/lib/clinic-time';
import { useVisitActions } from '../use-visit-actions';

const COLUMNS = ['confirmed', 'checked_in', 'in_progress', 'completed', 'no_show'] as const;
type QueueStatus = (typeof COLUMNS)[number];

// "مجاش" بيظهر بعد ربع ساعة من الميعاد
const NO_SHOW_AFTER = 15;

// وقت الانتظار: عادي · طويل (ربع ساعة) · كتير (نص ساعة)
const waitTone = (minutes: number): Tone =>
  minutes >= 30 ? 'danger' : minutes >= 15 ? 'warning' : 'neutral';

type Props = {
  appointments: Appointment[];
  practitioners: Practitioner[];
  nowMinutes: number;
  onSelect: (appointment: Appointment) => void;
  // حجز متابعة أو حجز تاني (نفس المريض والدكتور)
  onRebook: (appointment: Appointment) => void;
};

/**
 * طابور النهارده (D-05 · docs/20 · 3.4): عمود لكل حالة (05 §3).
 * في عمود "وصل": وقت الانتظار ورقم الدور عند كل دكتور. كل كارت عليه الخطوة الجاية بس.
 */
export function QueueBoard({ appointments, practitioners, nowMinutes, onSelect, onRebook }: Props) {
  const { t } = useTranslation('frontDesk');
  const locale = useLocale();
  const canCheckIn = useCan('checkin.write');
  const canBook = useCan('appointments.write');
  const { checkIn, start, complete, noShow, pendingId } = useVisitActions();

  const byStatus = (status: QueueStatus) =>
    appointments
      .filter((item) => item.status === status)
      .sort((a, b) =>
        status === 'checked_in'
          ? (a.checked_in_at ?? '').localeCompare(b.checked_in_at ?? '')
          : a.starts_at.localeCompare(b.starts_at),
      );

  const waiting = byStatus('checked_in');
  // رقم الدور عند نفس الدكتور (حسب وقت الوصول)
  const positionOf = (item: Appointment) =>
    waiting.filter((entry) => entry.practitioner_id === item.practitioner_id).indexOf(item) + 1;

  const practitionerName = (id: string) => {
    const practitioner = practitioners.find((entry) => entry.id === id);
    return practitioner ? localized(practitioner, 'name', locale) : '';
  };

  const actionsFor = (item: Appointment, status: AppointmentStatus) => {
    const loading = pendingId === item.id;
    const late = nowMinutes - clinicMinutes(item.starts_at) >= NO_SHOW_AFTER;
    switch (status) {
      case 'confirmed':
        return canCheckIn ? (
          <>
            <Button size="small" loading={loading} onClick={() => checkIn(item)}>
              {t('queue.checkIn')}
            </Button>
            {late && (
              <Button size="small" onClick={() => noShow(item)}>
                {t('queue.noShow')}
              </Button>
            )}
          </>
        ) : null;
      case 'checked_in':
        return canCheckIn ? (
          <Button size="small" loading={loading} onClick={() => start(item)}>
            {t('queue.start')}
          </Button>
        ) : null;
      case 'in_progress':
        return canCheckIn ? (
          <Button size="small" loading={loading} onClick={() => complete(item)}>
            {t('queue.complete')}
          </Button>
        ) : null;
      case 'completed':
        return canBook ? (
          <Button size="small" onClick={() => onRebook(item)}>
            {t('queue.followUp')}
          </Button>
        ) : null;
      case 'no_show':
        return canBook ? (
          <Button size="small" onClick={() => onRebook(item)}>
            {t('queue.rebook')}
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div
      role="group"
      aria-label={t('queue.label')}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(200px, 1fr))`,
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4,
      }}
    >
      {COLUMNS.map((status) => {
        const list = byStatus(status);
        return (
          <section
            key={status}
            aria-label={t(`queue.columns.${status}`)}
            style={{
              background: tokens.color.background,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: 12,
              padding: 10,
              minHeight: 200,
              // كل عمود بيعمل Scroll لوحده (عمود "خلص" بيكبر طول اليوم)
              maxHeight: 'calc(100dvh - 280px)',
              overflowY: 'auto',
            }}
          >
            <Flex justify="space-between" align="center" style={{ padding: '2px 4px 10px' }}>
              <Typography.Text strong>{t(`queue.columns.${status}`)}</Typography.Text>
              <Badge count={list.length} showZero color={tokens.color.mutedText} />
            </Flex>
            {list.length === 0 ? (
              <Typography.Text
                type="secondary"
                style={{ display: 'block', padding: '12px 4px', fontSize: 13 }}
              >
                {t('queue.empty')}
              </Typography.Text>
            ) : (
              <Flex vertical gap={8} role="list">
                {list.map((item) => {
                  const name = localized(item.patient, 'name', locale);
                  const waited =
                    status === 'checked_in' && item.checked_in_at
                      ? Math.max(0, nowMinutes - clinicMinutes(item.checked_in_at))
                      : null;
                  const actions = actionsFor(item, status);
                  return (
                    <div
                      key={item.id}
                      role="listitem"
                      style={{
                        background: tokens.color.surface,
                        border: `1px solid ${tokens.color.border}`,
                        borderInlineStart: `3px solid ${tokens.specialty[item.service.specialty]}`,
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        style={{
                          all: 'unset',
                          display: 'block',
                          width: '100%',
                          cursor: 'pointer',
                          borderRadius: 6,
                        }}
                      >
                        <Typography.Text strong ellipsis style={{ display: 'block' }}>
                          {name}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ display: 'block', fontSize: 12 }}
                        >
                          {formatSlot(item.starts_at, locale).time} ·{' '}
                          {practitionerName(item.practitioner_id)}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          ellipsis
                          style={{ display: 'block', fontSize: 12 }}
                        >
                          {localized(item.service, 'name', locale)}
                        </Typography.Text>
                      </button>
                      {(waited !== null || item.patient.balance_due > 0) && (
                        <Flex wrap gap={4} style={{ marginTop: 8 }}>
                          {waited !== null && (
                            <StatusTag tone={waitTone(waited)}>
                              {t('queue.waiting', { minutes: waited })}
                            </StatusTag>
                          )}
                          {waited !== null && (
                            <StatusTag tone="neutral">
                              {t('queue.position', {
                                n: positionOf(item),
                                name: practitionerName(item.practitioner_id),
                              })}
                            </StatusTag>
                          )}
                          {item.patient.balance_due > 0 && (
                            <StatusTag tone="warning">
                              {formatMoney(item.patient.balance_due, 'EGP', locale)}
                            </StatusTag>
                          )}
                        </Flex>
                      )}
                      {actions && (
                        <Flex gap={6} wrap style={{ marginTop: 10 }}>
                          {actions}
                        </Flex>
                      )}
                    </div>
                  );
                })}
              </Flex>
            )}
          </section>
        );
      })}
    </div>
  );
}
