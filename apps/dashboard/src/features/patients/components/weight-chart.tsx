import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { directionOf, formatDayParts, formatNumber } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';

type Point = { date: string; kg: number };

const W = 640;
const H = 240;
const PAD = { top: 16, bottom: 32, side: 40 };

/**
 * منحنى الوزن (آخر 12 أسبوع): SVG بسيط من غير مكتبة رسومات (المكتبة بتتقرر في 8.1 — DEC-52).
 * في العربي الوقت ماشي من اليمين للشمال. قارئ الشاشة بيقرا ملخص (أول وزن ← آخر وزن).
 */
export function WeightChart({ points }: { points: Point[] }) {
  const { t } = useTranslation('patients');
  const locale = useLocale();
  const gradient = useId();
  const rtl = directionOf(locale) === 'rtl';

  const values = points.map((point) => point.kg);
  const min = Math.floor(Math.min(...values) / 5) * 5;
  const max = Math.ceil(Math.max(...values) / 5) * 5 || min + 5;
  const ticks = Array.from({ length: (max - min) / 5 + 1 }, (_, index) => min + index * 5);

  const plotW = W - PAD.side * 2;
  const plotH = H - PAD.top - PAD.bottom;
  const xOf = (index: number) => {
    const x = PAD.side + (plotW * index) / Math.max(1, points.length - 1);
    return rtl ? W - x : x;
  };
  const yOf = (kg: number) => PAD.top + plotH - ((kg - min) / (max - min)) * plotH;

  const line = points.map((point, index) => `${xOf(index)},${yOf(point.kg)}`).join(' ');
  const area = `${xOf(0)},${PAD.top + plotH} ${line} ${xOf(points.length - 1)},${PAD.top + plotH}`;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={t('overview.weightSummary', {
        from: formatNumber(first.kg, locale),
        to: formatNumber(last.kg, locale),
        weeks: points.length,
      })}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={tokens.color.primary} stopOpacity={0.18} />
          <stop offset="100%" stopColor={tokens.color.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.side}
            x2={W - PAD.side}
            y1={yOf(tick)}
            y2={yOf(tick)}
            stroke={tokens.color.border}
          />
          <text
            x={rtl ? W - PAD.side + 8 : PAD.side - 8}
            y={yOf(tick) + 4}
            textAnchor={rtl ? 'start' : 'end'}
            fontSize={11}
            fill={tokens.color.mutedText}
          >
            {tick}
          </text>
        </g>
      ))}
      {points.map((point, index) =>
        index % 2 === 0 || index === points.length - 1 ? (
          <text
            key={point.date}
            x={xOf(index)}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fill={tokens.color.mutedText}
          >
            {formatDayParts(point.date, locale).day}
          </text>
        ) : null,
      )}
      <polygon points={area} fill={`url(#${gradient})`} />
      <polyline points={line} fill="none" stroke={tokens.color.primary} strokeWidth={2.5} />
      {points.map((point, index) => (
        <circle
          key={point.date}
          cx={xOf(index)}
          cy={yOf(point.kg)}
          r={index === points.length - 1 ? 5 : 3.5}
          fill={tokens.color.primary}
        />
      ))}
      <g transform={`translate(${xOf(points.length - 1)}, ${yOf(last.kg) - 26})`}>
        <rect x={-34} y={-14} width={68} height={24} rx={8} fill={tokens.color.primary} />
        <text x={0} y={3} textAnchor="middle" fontSize={12} fontWeight={600} fill="#fff">
          {t('overview.kg', { value: formatNumber(last.kg, locale) })}
        </text>
      </g>
    </svg>
  );
}
