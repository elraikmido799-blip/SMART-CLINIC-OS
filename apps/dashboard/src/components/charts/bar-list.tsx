import type { ReactNode } from 'react';
import { Typography } from 'antd';
import { tokens } from '@oxygen/config';
import { chartColor } from './palette';

export type BarItem = {
  id: string;
  label: string;
  // الرقم اللي بيحدد طول البار
  value: number;
  // النص اللي جنب البار (الرقم منسّق)
  text: string;
  // سطر صغير تحت الاسم (اختياري)
  hint?: ReactNode;
};

/**
 * بارات أفقية بأسماء ورقم مكتوب (D-28: مقارنة الفروع، D-30: الفانل). الطول نسبة من أكبر قيمة،
 * ولون واحد (الهوية) لأن الاسم والرقم مكتوبين. كل بار `role="img"` بوصفه، والقايمة `list`.
 */
export function BarList({
  items,
  color = chartColor(0),
  label,
}: {
  items: BarItem[];
  color?: string;
  label: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul aria-label={label} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((item) => (
        <li key={item.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <Typography.Text>{item.label}</Typography.Text>
            <Typography.Text strong>{item.text}</Typography.Text>
          </div>
          <div
            aria-hidden
            style={{
              marginTop: 4,
              height: 10,
              borderRadius: 5,
              background: tokens.color.mist,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(item.value / max) * 100}%`,
                height: '100%',
                borderRadius: 5,
                background: color,
              }}
            />
          </div>
          {item.hint && (
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 2 }}>
              {item.hint}
            </Typography.Text>
          )}
        </li>
      ))}
    </ul>
  );
}
