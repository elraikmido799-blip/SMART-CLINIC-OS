import type { ReactNode } from 'react';
import { Card, Flex, Typography } from 'antd';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { tokens } from '@oxygen/config';
import { TONES } from '@/app/tones';

type Trend = {
  // التغيير بالنسبة المئوية (+12 أو -3)
  change: number;
  // الطلوع كويس (المرضى) ولا وحش (مجاش)؟ اللون بيتحدد على كده، والسهم بيمشي مع الرقم (ملاحظة B6)
  goodWhen: 'up' | 'down';
  label?: string;
};

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  trend?: Trend;
};

/** كارت رقم (KPI): أيقونة · اسم الرقم · الرقم · السهم ونسبته */
export function StatCard({ icon, label, value, trend }: StatCardProps) {
  const up = (trend?.change ?? 0) >= 0;
  const good = trend && (up ? trend.goodWhen === 'up' : trend.goodWhen === 'down');
  const Arrow = up ? ArrowUp : ArrowDown;

  return (
    <Card styles={{ body: { padding: 20 } }}>
      <Flex gap={12} align="center" style={{ marginBottom: 12 }}>
        <span
          aria-hidden
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: tokens.color.mist,
            color: tokens.color.primary,
          }}
        >
          {icon}
        </span>
        <Typography.Text type="secondary">{label}</Typography.Text>
      </Flex>
      <Typography.Text strong style={{ display: 'block', fontSize: 28, lineHeight: 1.2 }}>
        {value}
      </Typography.Text>
      {trend && (
        <Flex gap={6} align="center" wrap style={{ marginTop: 8, fontSize: 13 }}>
          <Flex
            gap={2}
            align="center"
            style={{ color: good ? TONES.success.text : TONES.danger.text, fontWeight: 600 }}
          >
            <Arrow size={14} aria-hidden />
            {`${up ? '+' : ''}${trend.change}%`}
          </Flex>
          {trend.label && <Typography.Text type="secondary">{trend.label}</Typography.Text>}
        </Flex>
      )}
    </Card>
  );
}
