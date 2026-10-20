import { Flex, Typography } from 'antd';
import { directionOf, formatDayParts, formatNumber } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { chartColor, GRID } from './palette';

export type LineSeries = { name: string; values: number[] };

const W = 640;
const H = 240;
const PAD = { top: 16, bottom: 32, side: 48 };

/**
 * رسم خطي لأكتر من سلسلة (D-28): الأيام على المحور الأفقي (مبتدية من اليمين في العربي)،
 * الـLegend فوق بأسماء السلاسل، وقارئ الشاشة بياخد ملخص (`summary`) بدل الرسم.
 * `dates` أيام ISO بنفس طول كل سلسلة. `format` بيكتب القيمة على المحور.
 */
export function LineChart({
  dates,
  series,
  summary,
  format = (value, locale) => formatNumber(value, locale),
}: {
  dates: string[];
  series: LineSeries[];
  summary: string;
  format?: (value: number, locale: ReturnType<typeof useLocale>) => string;
}) {
  const locale = useLocale();
  const rtl = directionOf(locale) === 'rtl';
  const all = series.flatMap((item) => item.values);
  const max = Math.max(1, ...all);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / magnitude) * magnitude;
  const ticks = [0, 1, 2, 3, 4].map((step) => (top / 4) * step);
  const plotW = W - PAD.side * 2;
  const plotH = H - PAD.top - PAD.bottom;
  const last = Math.max(1, dates.length - 1);
  const xOf = (index: number) =>
    PAD.side + (rtl ? plotW - (index / last) * plotW : (index / last) * plotW);
  const yOf = (value: number) => PAD.top + plotH - (value / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil(dates.length / 6));

  return (
    <figure style={{ margin: 0 }}>
      <Flex gap={16} wrap style={{ marginBottom: 8 }}>
        {series.map((item, index) => (
          <Flex key={item.name} gap={6} align="center">
            <span
              aria-hidden
              style={{ width: 16, height: 3, borderRadius: 2, background: chartColor(index) }}
            />
            <Typography.Text>{item.name}</Typography.Text>
          </Flex>
        ))}
      </Flex>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={summary}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.side} x2={W - PAD.side} y1={yOf(tick)} y2={yOf(tick)} stroke={GRID} />
            <text
              x={rtl ? W - PAD.side + 6 : PAD.side - 6}
              y={yOf(tick) + 4}
              textAnchor={rtl ? 'start' : 'end'}
              fontSize={12}
              fill={tokens.color.mutedText}
            >
              {format(tick, locale)}
            </text>
          </g>
        ))}
        {dates.map((date, index) =>
          index % labelEvery === 0 ? (
            <text
              key={date}
              x={xOf(index)}
              y={H - 10}
              textAnchor="middle"
              fontSize={12}
              fill={tokens.color.mutedText}
            >
              {formatDayParts(date, locale).day}
            </text>
          ) : null,
        )}
        {series.map((item, seriesIndex) => (
          <polyline
            key={item.name}
            fill="none"
            stroke={chartColor(seriesIndex)}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={seriesIndex === 1 ? '6 4' : undefined}
            points={item.values.map((value, index) => `${xOf(index)},${yOf(value)}`).join(' ')}
          />
        ))}
      </svg>
    </figure>
  );
}
