import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { Typography } from 'antd';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { formatTime } from '@oxygen/shared';
import { tokens, type Specialty } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { SpecialtyIcon } from '@/components/specialty-icon';
import { clinicMinutes } from '@/lib/clinic-time';
import { DAY_END, DAY_START, PX_PER_MIN, SLOT_MIN, toHHmm } from '../grid';
import type { Appointment, TimeBlock } from '../types';
import { AppointmentBlock } from './appointment-block';

const TIME_COL = 72;
const HEADER = 64;
// أقل ارتفاع للميعاد (ميعاد ربع ساعة = 21px، صغير على الكلام)
const MIN_BLOCK = 28;

const y = (minutes: number) => (minutes - DAY_START) * PX_PER_MIN;
const BODY_HEIGHT = y(DAY_END);
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

export type GridColumn = {
  id: string;
  title: string;
  subtitle?: string;
  specialty?: Specialty;
  // خط "دلوقتي" بيظهر في الأعمدة اللي هي النهارده بس
  isToday: boolean;
};

type Props = {
  columns: GridColumn[];
  appointments: Appointment[];
  columnOf: (appointment: Appointment) => string;
  timeBlocks?: TimeBlock[];
  blockColumnOf?: (block: TimeBlock) => string | null;
  // الدقيقة دلوقتي بتوقيت مصر
  nowMinutes: number;
  onSelect: (appointment: Appointment) => void;
  onBlockSelect?: (block: TimeBlock) => void;
  // دوسة على مكان فاضي = حجز جديد في العمود ده والوقت ده
  onSlotClick?: (columnId: string, minutes: number) => void;
  // السحب = تأجيل (لو مسموح للميعاد ده)
  canDrag?: (appointment: Appointment) => boolean;
  onMove?: (appointment: Appointment, columnId: string, minutes: number) => void;
  maxHeight?: number | string;
  // أقل عرض للعمود (الأسبوع أضيق عشان الـ7 أيام يساعوا)
  minColumnWidth?: number;
};

function DraggableAppointment({
  appointment,
  disabled,
  children,
}: {
  appointment: Appointment;
  disabled: boolean;
  children: (drag: {
    ref: (node: HTMLElement | null) => void;
    props: object;
    dragging: boolean;
    offset: string | undefined;
  }) => ReactNode;
}) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: { appointment },
    disabled,
  });
  return children({
    ref: setNodeRef,
    props: disabled ? {} : { ...attributes, ...listeners },
    dragging: isDragging,
    offset: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  });
}

function GridColumnBody({
  column,
  slotClickable,
  onSlotClick,
  children,
}: {
  column: GridColumn;
  slotClickable: boolean;
  onSlotClick?: (columnId: string, minutes: number) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation('appointments');
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onSlotClick || event.target !== event.currentTarget) return;
    const offset = event.nativeEvent.offsetY;
    const minutes = DAY_START + Math.floor(offset / PX_PER_MIN / SLOT_MIN) * SLOT_MIN;
    onSlotClick(column.id, Math.min(minutes, DAY_END - SLOT_MIN));
  };

  return (
    <div
      ref={setNodeRef}
      role="list"
      aria-label={t('grid.column', { name: column.title })}
      onClick={handleClick}
      style={{
        position: 'relative',
        height: BODY_HEIGHT,
        borderInlineStart: `1px solid ${tokens.color.border}`,
        backgroundColor: isOver ? tokens.color.mist : undefined,
        backgroundImage: `repeating-linear-gradient(to bottom, ${tokens.color.border} 0 1px, transparent 1px ${60 * PX_PER_MIN}px)`,
        cursor: slotClickable ? 'copy' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * كالندر بالساعات: عمود لكل دكتور أو أوضة أو يوم (D-02 · 3.1 · 3.2).
 * عمود الوقت على ناحية البداية وثابت مع الـScroll بالعرض، وأول ما يفتح بينزل لخط "دلوقتي".
 * السحب بالماوس (dnd-kit) بيأجّل الميعاد كل ربع ساعة، والكيبورد بيأجّل من تفاصيل الميعاد (DEC-46).
 */
export function TimeGrid({
  columns,
  appointments,
  columnOf,
  timeBlocks = [],
  blockColumnOf,
  nowMinutes,
  onSelect,
  onBlockSelect,
  onSlotClick,
  canDrag,
  onMove,
  maxHeight = 640,
  minColumnWidth = 180,
}: Props) {
  const { t } = useTranslation('calendar');
  const { t: tAppointments } = useTranslation('appointments');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const nowVisible =
    nowMinutes >= DAY_START && nowMinutes <= DAY_END && columns.some((c) => c.isToday);

  useEffect(() => {
    if (!scrollRef.current) return;
    // أول مرة بس: خط "دلوقتي"، أو أول اليوم
    scrollRef.current.scrollTop = nowVisible ? Math.max(0, y(nowMinutes) - 120) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = ({ active, over, delta }: DragEndEvent) => {
    const appointment = (active.data.current as { appointment: Appointment } | undefined)
      ?.appointment;
    if (!appointment || !over || !onMove) return;
    const start = clinicMinutes(appointment.starts_at);
    const duration = clinicMinutes(appointment.ends_at) - start;
    const shift = Math.round(delta.y / PX_PER_MIN / SLOT_MIN) * SLOT_MIN;
    const minutes = Math.min(Math.max(start + shift, DAY_START), DAY_END - duration);
    const columnId = String(over.id);
    if (columnId === columnOf(appointment) && minutes === start) return;
    onMove(appointment, columnId, minutes);
  };

  const stickyHeader = {
    position: 'sticky' as const,
    top: 0,
    zIndex: 3,
    height: HEADER,
    background: tokens.color.surface,
    borderBottom: `1px solid ${tokens.color.border}`,
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div ref={scrollRef} style={{ overflow: 'auto', maxHeight, position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COL}px repeat(${columns.length}, minmax(${minColumnWidth}px, 1fr))`,
            minWidth: TIME_COL + columns.length * minColumnWidth,
          }}
        >
          {/* الصف الأول: عناوين الأعمدة */}
          <div
            style={{
              ...stickyHeader,
              insetInlineStart: 0,
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography.Text type="secondary" strong>
              {tAppointments('grid.time')}
            </Typography.Text>
          </div>
          {columns.map((column) => (
            <div
              key={column.id}
              style={{
                ...stickyHeader,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingInline: 12,
                borderInlineStart: `1px solid ${tokens.color.border}`,
                background:
                  column.isToday && !column.specialty ? tokens.color.mist : tokens.color.surface,
              }}
            >
              {column.specialty && (
                <>
                  <span
                    aria-hidden
                    style={{
                      width: 3,
                      alignSelf: 'stretch',
                      marginBlock: 14,
                      borderRadius: 2,
                      background: tokens.specialty[column.specialty],
                    }}
                  />
                  <SpecialtyIcon specialty={column.specialty} />
                </>
              )}
              <div style={{ minWidth: 0 }}>
                <Typography.Text strong ellipsis style={{ display: 'block' }}>
                  {column.title}
                </Typography.Text>
                {column.subtitle && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {column.subtitle}
                  </Typography.Text>
                )}
              </div>
            </div>
          ))}

          {/* عمود الوقت (ثابت مع الـScroll بالعرض) */}
          <div
            style={{
              position: 'sticky',
              insetInlineStart: 0,
              zIndex: 2,
              height: BODY_HEIGHT,
              background: tokens.color.surface,
            }}
          >
            {HOURS.filter(
              // الساعة اللي جنب خط "دلوقتي" بتستخبى عشان متتداخلش مع وقته
              (minutes) => !nowVisible || Math.abs(y(minutes) - y(nowMinutes)) > 18,
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
            {nowVisible && (
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

          {columns.map((column) => (
            <GridColumnBody
              key={column.id}
              column={column}
              slotClickable={!!onSlotClick}
              onSlotClick={onSlotClick}
            >
              {timeBlocks
                .filter((block) => blockColumnOf?.(block) === column.id)
                .map((block) => {
                  const start = clinicMinutes(block.starts_at);
                  const end = clinicMinutes(block.ends_at);
                  const label = t(`block.reasons.${block.reason}`);
                  return (
                    <div key={block.id} role="listitem">
                      <button
                        type="button"
                        disabled={!onBlockSelect}
                        onClick={() => onBlockSelect?.(block)}
                        aria-label={`${label} · ${formatTime(toHHmm(start), locale)}`}
                        style={{
                          position: 'absolute',
                          top: y(start) + 2,
                          height: Math.max((end - start) * PX_PER_MIN, MIN_BLOCK) - 4,
                          insetInline: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0 8px',
                          font: 'inherit',
                          fontSize: 12,
                          color: tokens.color.mutedText,
                          border: `1px dashed ${tokens.color.fieldBorder}`,
                          borderRadius: 8,
                          cursor: onBlockSelect ? 'pointer' : 'default',
                          background: `repeating-linear-gradient(135deg, ${tokens.color.background} 0 6px, ${tokens.color.border} 6px 8px)`,
                        }}
                      >
                        <Lock size={12} aria-hidden />
                        {label}
                      </button>
                    </div>
                  );
                })}
              {appointments
                .filter((item) => columnOf(item) === column.id && item.status !== 'cancelled')
                .map((item) => {
                  const start = clinicMinutes(item.starts_at);
                  const end = clinicMinutes(item.ends_at);
                  return (
                    <div key={item.id} role="listitem">
                      <DraggableAppointment
                        appointment={item}
                        disabled={!onMove || !canDrag?.(item)}
                      >
                        {(drag) => (
                          <AppointmentBlock
                            appointment={item}
                            top={y(start) + 2}
                            height={Math.max((end - start) * PX_PER_MIN, MIN_BLOCK)}
                            onSelect={onSelect}
                            drag={drag}
                          />
                        )}
                      </DraggableAppointment>
                    </div>
                  );
                })}
              {nowVisible && column.isToday && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    insetInline: 0,
                    top: y(nowMinutes),
                    height: 2,
                    background: tokens.color.danger,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </GridColumnBody>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
