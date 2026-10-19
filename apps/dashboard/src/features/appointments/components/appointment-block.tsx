import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatSlot, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { StatusTag } from '@/components/tags';
import { STATUS_TONE } from '../status';
import type { Appointment } from '../types';

type Props = {
  appointment: Appointment;
  top: number;
  height: number;
  onSelect: (appointment: Appointment) => void;
};

/**
 * كارت الميعاد في الكالندر (D-02): خط رفيع بلون التخصص.
 * السطر الأول: المريض + الحالة · التاني: الوقت · الخدمة (المواعيد القصيرة السطر الأول بس).
 */
export function AppointmentBlock({ appointment, top, height, onSelect }: Props) {
  const { t } = useTranslation('appointments');
  const locale = useLocale();
  const patient = localized(appointment.patient, 'name', locale);
  const service = localized(appointment.service, 'name', locale);
  const start = formatSlot(appointment.starts_at, locale).time;
  const end = formatSlot(appointment.ends_at, locale).time;
  const status = t(`status.${appointment.status}`);
  const compact = height < 44;
  const faded = appointment.status === 'completed' || appointment.status === 'no_show';
  const line = { display: 'block', minWidth: 0 } as const;

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment)}
      aria-label={`${patient} · ${service} · ${start} – ${end} · ${status}`}
      style={{
        position: 'absolute',
        top,
        height: height - 4,
        insetInline: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: compact ? 'center' : 'flex-start',
        gap: 2,
        padding: compact ? '0 8px' : '6px 8px',
        overflow: 'hidden',
        textAlign: 'start',
        cursor: 'pointer',
        font: 'inherit',
        color: tokens.color.ink,
        background: faded ? tokens.color.background : tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderInlineStart: `3px solid ${tokens.specialty[appointment.service.specialty]}`,
        borderRadius: 8,
        boxShadow: faded ? 'none' : '0 1px 2px rgba(14, 36, 64, 0.05)',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        <Typography.Text strong ellipsis style={{ ...line, flex: 1, fontSize: 13 }}>
          {patient}
        </Typography.Text>
        <StatusTag tone={STATUS_TONE[appointment.status]}>{status}</StatusTag>
      </span>
      {!compact && (
        <Typography.Text type="secondary" ellipsis style={{ ...line, fontSize: 12 }}>
          {start} – {end} · {service}
        </Typography.Text>
      )}
    </button>
  );
}
