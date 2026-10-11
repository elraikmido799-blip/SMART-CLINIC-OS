'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatDate, formatNumber, isLocale } from '@oxygen/shared';
import type { Measurement } from '@/types/portal';

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 24, right: 24, bottom: 32, left: 40 };
const STEP = 5;

/**
 * رسم الوزن (PP-01 · PP-03): خط Teal بنقط، وآخر نقطة أكبر، وخط الهدف متقطع.
 * SVG من غير مكتبة رسوم (DEC-39). قارئ الشاشة بيقرا جدول مخفي بنفس الأرقام.
 */
export function WeightChart({ data, goal }: { data: Measurement[]; goal: number | null }) {
  const t = useTranslations('portal.chart');
  const locale = useLocale();
  if (!isLocale(locale) || data.length < 2) return null;

  const values = data.map((item) => item.weight_kg);
  const min = Math.floor((Math.min(...values, goal ?? Infinity) - 2) / STEP) * STEP;
  const max = Math.ceil((Math.max(...values) + 2) / STEP) * STEP;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (index / (data.length - 1)) * innerW;
  const y = (value: number) => PAD.top + ((max - value) / (max - min)) * innerH;
  const ticks = Array.from({ length: (max - min) / STEP + 1 }, (_, i) => min + i * STEP);
  const path = values
    .map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`)
    .join(' ');
  const first = values[0];
  const last = values.at(-1)!;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={t('summary', {
          from: formatNumber(first, locale),
          to: formatNumber(last, locale),
          weeks: data.length,
        })}
        // الرسم نفسه دايمًا من الشمال لليمين (الزمن)، حتى في العربي
        direction="ltr"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
            />
            <text
              x={PAD.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[14px]"
            >
              {tick}
            </text>
          </g>
        ))}
        {goal !== null && (
          <g>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(goal)}
              y2={y(goal)}
              strokeDasharray="6 5"
              className="stroke-primary/70"
              strokeWidth={1.5}
            />
          </g>
        )}
        <path
          d={path}
          fill="none"
          className="stroke-primary"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {values.map((value, index) => (
          <circle
            key={data[index].date}
            cx={x(index)}
            cy={y(value)}
            r={index === values.length - 1 ? 7 : 4}
            className="fill-primary stroke-card"
            strokeWidth={2}
          />
        ))}
        <text x={x(0) + 8} y={y(first) - 10} className="fill-primary text-[15px] font-bold">
          {t('kg', { value: formatNumber(first, locale) })}
        </text>
        <text
          x={x(values.length - 1)}
          y={y(last) - 14}
          textAnchor="end"
          className="fill-primary text-[15px] font-bold"
        >
          {t('kg', { value: formatNumber(last, locale) })}
        </text>
        {data.map((item, index) => (
          <text
            key={item.date}
            x={x(index)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[14px]"
          >
            {index + 1}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{t('weeks')}</span>
        {goal !== null && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-5 border-t-2 border-dashed border-primary/70"
              aria-hidden
            />
            {t('goal', { goal: formatNumber(goal, locale) })}
          </span>
        )}
      </figcaption>
      <table className="sr-only">
        <caption>{t('tableCaption')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('date')}</th>
            <th scope="col">{t('weight')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date}>
              <td>{formatDate(item.date, locale)}</td>
              <td>{t('kg', { value: formatNumber(item.weight_kg, locale) })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
