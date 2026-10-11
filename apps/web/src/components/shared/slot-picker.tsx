'use client';

import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarSearch, ChevronLeft, ChevronRight, Moon, Sun, Sunrise } from 'lucide-react';
import { formatDayParts, formatSlot, isLocale } from '@oxygen/shared';
import { useGetSlotsQuery } from '@/api/bookings.api';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays, cairoHourOf, todayInCairo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Slot, SlotsQuery } from '@/types/booking';

const DAYS = 14;

const PERIODS = [
  { key: 'morning', icon: Sunrise, from: 0, to: 12 },
  { key: 'afternoon', icon: Sun, from: 12, to: 17 },
  { key: 'evening', icon: Moon, from: 17, to: 24 },
] as const;

type SlotPickerProps = {
  query: Omit<SlotsQuery, 'date'>;
  // اليوم المختار. من غير يوم = النهارده، أو أقرب يوم فيه ميعاد فاضي
  date?: string;
  onDateChange: (date: string) => void;
  // الميعاد المختار (ISO)
  value?: string;
  onSelect: (slot: Slot) => void;
};

/**
 * اختيار الميعاد (A7): شريط أسبوعين + المواعيد مقسّمة صباحًا / ظهرًا / مساءً.
 * في الحجز (5.1) وفي التأجيل في البوابة (6.2). المحجوز بيبان مقفول ومشطوب.
 * لو اليوم مفيهوش ميعاد فاضي: "أقرب ميعاد" بيودّي لأقرب يوم (next_available_date من الـAPI).
 */
export function SlotPicker({ query, date, onDateChange, value, onSelect }: SlotPickerProps) {
  const t = useTranslations('slotPicker');
  const locale = useLocale();
  const stripRef = useRef<HTMLDivElement>(null);
  const today = todayInCairo();
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i));

  // من غير يوم مختار: نسأل عن النهارده، ولو مفيهوش نعرض أقرب يوم على طول (من غير ما الزائر يدوّر)
  const first = useGetSlotsQuery({ ...query, date: date ?? today });
  const autoDate =
    !date && first.data && first.data.next_available_date !== today
      ? (first.data.next_available_date ?? undefined)
      : undefined;
  const auto = useGetSlotsQuery({ ...query, date: autoDate ?? today }, { skip: !autoDate });
  const activeDate = date ?? autoDate ?? today;
  const current = autoDate ? auto : first;

  if (!isLocale(locale)) return null;

  const scrollStrip = (direction: 1 | -1) => {
    const strip = stripRef.current;
    if (!strip) return;
    // في العربي الـscroll بالسالب (RTL)
    const rtl = getComputedStyle(strip).direction === 'rtl';
    strip.scrollBy({
      left: direction * (rtl ? -1 : 1) * strip.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  const slots = current.data?.data ?? [];
  const hasFree = slots.some((slot) => slot.available);
  const nextDate = current.data?.next_available_date;

  return (
    <div className="space-y-6">
      <section aria-labelledby="slot-date-title">
        <h3 id="slot-date-title" className="font-heading text-lg font-bold text-ink">
          {t('dateTitle')}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            aria-label={t('previousDays')}
            className="hidden size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-mist sm:grid"
          >
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden />
          </button>
          <div
            ref={stripRef}
            role="listbox"
            aria-labelledby="slot-date-title"
            className="flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth pb-1"
          >
            {days.map((day) => {
              const parts = formatDayParts(day, locale);
              const selected = day === activeDate;
              return (
                <button
                  key={day}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onDateChange(day)}
                  className={cn(
                    'flex h-16 w-20 shrink-0 snap-start flex-col items-center justify-center rounded-lg border text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                    selected
                      ? 'border-primary bg-primary font-semibold text-primary-foreground'
                      : 'border-border bg-card text-ink hover:border-primary',
                  )}
                >
                  <span className="font-semibold">
                    {day === today ? t('today') : parts.weekday}
                  </span>
                  <span
                    className={selected ? 'text-primary-foreground/90' : 'text-muted-foreground'}
                  >
                    {parts.day}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            aria-label={t('nextDays')}
            className="hidden size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-mist sm:grid"
          >
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden />
          </button>
        </div>
      </section>

      <section aria-labelledby="slot-time-title" aria-busy={current.isFetching}>
        <h3 id="slot-time-title" className="font-heading text-lg font-bold text-ink">
          {t('timeTitle')}
        </h3>

        {current.isLoading || (current.isFetching && !current.data) ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-11 rounded-md" />
            ))}
          </div>
        ) : current.isError ? (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-border bg-card p-5 text-center"
          >
            <p className="text-ink">{t('error')}</p>
            <button
              type="button"
              onClick={() => current.refetch()}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        ) : !hasFree ? (
          <div className="mt-3 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-6 text-center">
            <CalendarSearch className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
            <p className="text-ink">{t('noSlots')}</p>
            {nextDate && nextDate !== activeDate && (
              <button
                type="button"
                onClick={() => onDateChange(nextDate)}
                className="inline-flex min-h-11 items-center rounded-md border border-primary px-4 font-semibold text-primary hover:bg-mist"
              >
                {t('nextAvailable', {
                  day: `${formatDayParts(nextDate, locale).weekday} ${formatDayParts(nextDate, locale).day}`,
                })}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-3 grid gap-5 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border rtl:md:divide-x-reverse">
            {PERIODS.map((period) => {
              const periodSlots = slots.filter((slot) => {
                const hour = cairoHourOf(slot.starts_at);
                return hour >= period.from && hour < period.to;
              });
              return (
                <div key={period.key} className="md:px-4 md:first:ps-0 md:last:pe-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <period.icon className="size-4 text-primary" aria-hidden />
                    {t(`periods.${period.key}`)}
                  </p>
                  {periodSlots.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">{t('periodEmpty')}</p>
                  ) : (
                    <ul className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-2">
                      {periodSlots.map((slot) => {
                        const selected = slot.starts_at === value;
                        const time = formatSlot(slot.starts_at, locale).time;
                        return (
                          <li key={slot.starts_at}>
                            <button
                              type="button"
                              disabled={!slot.available}
                              aria-pressed={selected}
                              aria-label={slot.available ? undefined : t('taken', { time })}
                              onClick={() => onSelect(slot)}
                              className={cn(
                                'h-11 w-full rounded-md border text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                                selected
                                  ? 'border-primary bg-primary font-semibold text-primary-foreground'
                                  : slot.available
                                    ? 'border-border bg-card text-ink hover:border-primary'
                                    : 'cursor-not-allowed border-dashed border-border bg-transparent text-muted-foreground/80 line-through',
                              )}
                            >
                              <bdi>{time}</bdi>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
