import { directionOf } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';

/**
 * خط صغير للاتجاه (آخر القراءات). زينة بس (aria-hidden): الأرقام نفسها في الجدول اللي جنبه.
 * في العربي الوقت ماشي من اليمين للشمال (زي منحنى الوزن).
 */
export function Sparkline({
  values,
  width = 120,
  height = 36,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const locale = useLocale();
  if (values.length < 2) return null;
  const rtl = directionOf(locale) === 'rtl';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;
  const points = values
    .map((value, index) => {
      const x = pad + ((width - pad * 2) * index) / (values.length - 1);
      const y = height - pad - ((value - min) / span) * (height - pad * 2);
      return `${rtl ? width - x : x},${y}`;
    })
    .join(' ');
  const [lastX, lastY] = points.split(' ').at(-1)!.split(',');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      focusable="false"
    >
      <polyline points={points} fill="none" stroke={tokens.color.primary} strokeWidth={2} />
      <circle cx={lastX} cy={lastY} r={3.5} fill={tokens.color.primary} />
    </svg>
  );
}
