import { Flex, Typography } from 'antd';
import { formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { chartColor } from './palette';

export type Slice = { id: string; label: string; value: number };

const SIZE = 160;
const RADIUS = 60;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * دونات بجنبها جدول (D-28: مصادر الـLeads). الجدول فيه الاسم والعدد والنسبة، فالرسم مش لوحده معتمد على اللون.
 * الشرايح بالترتيب من الأكبر، وقارئ الشاشة بياخد الجدول بدل الرسم (`aria-hidden` على الـSVG).
 */
export function Donut({ slices, label }: { slices: Slice[]; label: string }) {
  const locale = useLocale();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;

  return (
    <Flex gap={24} align="center" wrap>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
        style={{ width: 160, height: 160, flex: 'none' }}
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {total > 0 &&
            slices.map((slice, index) => {
              const length = (slice.value / total) * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={slice.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={chartColor(index)}
                  strokeWidth={STROKE}
                  strokeDasharray={`${Math.max(0, length - 1.5)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return circle;
            })}
        </g>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight={700}
          fill="currentColor"
        >
          {formatNumber(total, locale)}
        </text>
      </svg>
      <table style={{ flex: '1 1 200px', borderCollapse: 'collapse' }} aria-label={label}>
        <tbody>
          {slices.map((slice, index) => (
            <tr key={slice.id}>
              <td style={{ padding: '4px 0' }}>
                <Flex gap={8} align="center">
                  <span
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: chartColor(index),
                      flex: 'none',
                    }}
                  />
                  <Typography.Text>{slice.label}</Typography.Text>
                </Flex>
              </td>
              <td style={{ padding: '4px 12px', textAlign: 'end' }}>
                <Typography.Text strong>{formatNumber(slice.value, locale)}</Typography.Text>
              </td>
              <td style={{ padding: '4px 0', textAlign: 'end' }}>
                <Typography.Text type="secondary">
                  {total
                    ? `${formatNumber(Math.round((slice.value / total) * 100), locale)}%`
                    : '—'}
                </Typography.Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Flex>
  );
}
