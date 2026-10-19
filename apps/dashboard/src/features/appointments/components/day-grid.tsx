import { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatTime, localized } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { SpecialtyIcon } from '@/components/specialty-icon';
import { clinicMinutes } from '@/lib/clinic-time';
import type { Appointment, Practitioner } from '../types';
import { AppointmentBlock } from './appointment-block';

const START = 9 * 60;
const END = 21 * 60;
const PX_PER_MIN = 1.4; // ساعة = 84px
const TIME_COL = 72;
const MIN_COL = 180;
// أقل ارتفاع للميعاد (ميعاد ربع ساعة = 21px، صغير على الكلام)
const MIN_BLOCK = 28;
const HEADER = 64;

const y = (minutes: number) => (minutes - START) * PX_PER_MIN;
const BODY_HEIGHT = y(END);
const HOURS = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START + i * 60);

const toHHmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

type Props = {
  practitioners: Practitioner[];
  appointments: Appointment[];
  // الدقيقة دلوقتي (لو اليوم المعروض هو النهارده) — خط "دلوقتي"
  nowMinutes: number | null;
  onSelect: (appointment: Appointment) => void;
  maxHeight?: number | string;
};

/**
 * كالندر اليوم: عمود لكل دكتور (زي D-02-reception.png). عمود الوقت على ناحية البداية
 * (يمين في العربي)، وبيفضل ثابت مع الـScroll بالعرض. أول ما يفتح بيروح لخط "دلوقتي".
 */
export function DayGrid({
  practitioners,
  appointments,
  nowMinutes,
  onSelect,
  maxHeight = 640,
}: Props) {
  const { t } = useTranslation('appointments');
  const { t: tCommon } = useTranslation();
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const showNow = nowMinutes !== null && nowMinutes >= START && nowMinutes <= END;

  useEffect(() => {
    if (!showNow || !scrollRef.current) return;
    scrollRef.current.scrollTop = Math.max(0, y(nowMinutes) - 120);
    // أول مرة بس
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hourLines = `repeating-linear-gradient(to bottom, ${tokens.color.border} 0 1px, transparent 1px ${60 * PX_PER_MIN}px)`;
  const stickyHeader = {
    position: 'sticky' as const,
    top: 0,
    zIndex: 2,
    height: HEADER,
    background: tokens.color.surface,
    borderBottom: `1px solid ${tokens.color.border}`,
  };

  return (
    <div ref={scrollRef} style={{ overflow: 'auto', maxHeight, position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${TIME_COL}px repeat(${practitioners.length}, minmax(${MIN_COL}px, 1fr))`,
          minWidth: TIME_COL + practitioners.length * MIN_COL,
        }}
      >
        {/* الصف الأول: عناوين الأعمدة */}
        <div
          style={{
            ...stickyHeader,
            insetInlineStart: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography.Text type="secondary" strong>
            {t('grid.time')}
          </Typography.Text>
        </div>
        {practitioners.map((practitioner) => (
          <div
            key={practitioner.id}
            style={{
              ...stickyHeader,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingInline: 12,
              borderInlineStart: `1px solid ${tokens.color.border}`,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 3,
                alignSelf: 'stretch',
                marginBlock: 14,
                borderRadius: 2,
                background: tokens.specialty[practitioner.specialty],
              }}
            />
            <SpecialtyIcon specialty={practitioner.specialty} />
            <div style={{ minWidth: 0 }}>
              <Typography.Text strong ellipsis style={{ display: 'block' }}>
                {localized(practitioner, 'name', locale)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {tCommon(`specialties.${practitioner.specialty}`)}
              </Typography.Text>
            </div>
          </div>
        ))}

        {/* عمود الوقت (ثابت مع الـScroll بالعرض) */}
        <div
          style={{
            position: 'sticky',
            insetInlineStart: 0,
            zIndex: 1,
            height: BODY_HEIGHT,
            background: tokens.color.surface,
          }}
        >
          {HOURS.filter(
            // الساعة اللي جنب خط "دلوقتي" بتستخبى عشان متتداخلش مع وقته
            (minutes) => !showNow || Math.abs(y(minutes) - y(nowMinutes)) > 18,
          ).map((minutes) => (
            <Typography.Text
              key={minutes}
              type="secondary"
              style={{
                position: 'absolute',
                top: Math.max(0, y(minutes) - 9),
                insetInlineEnd: 10,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {formatTime(toHHmm(minutes), locale)}
            </Typography.Text>
          ))}
          {showNow && (
            <span
              style={{
                position: 'absolute',
                top: y(nowMinutes) - 11,
                insetInlineEnd: 4,
                padding: '1px 8px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                // الأحمر الغامق (contrast 6.6 مع الأبيض) — الأحمر العادي للخط بس
                background: '#952F32',
              }}
            >
              {formatTime(toHHmm(nowMinutes), locale)}
            </span>
          )}
        </div>

        {/* عمود لكل دكتور */}
        {practitioners.map((practitioner) => {
          const name = localized(practitioner, 'name', locale);
          return (
            <div
              key={practitioner.id}
              role="list"
              aria-label={t('grid.column', { name })}
              style={{
                position: 'relative',
                height: BODY_HEIGHT,
                borderInlineStart: `1px solid ${tokens.color.border}`,
                backgroundImage: hourLines,
              }}
            >
              {appointments
                .filter(
                  (item) => item.practitioner_id === practitioner.id && item.status !== 'cancelled',
                )
                .map((item) => {
                  const start = clinicMinutes(item.starts_at);
                  const end = clinicMinutes(item.ends_at);
                  return (
                    <div key={item.id} role="listitem">
                      <AppointmentBlock
                        appointment={item}
                        top={y(start) + 2}
                        height={Math.max((end - start) * PX_PER_MIN, MIN_BLOCK)}
                        onSelect={onSelect}
                      />
                    </div>
                  );
                })}
              {showNow && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    insetInline: 0,
                    top: y(nowMinutes),
                    height: 2,
                    background: tokens.color.danger,
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
