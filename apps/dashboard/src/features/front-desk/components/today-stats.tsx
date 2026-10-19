import type { ReactNode } from 'react';
import { Card, Flex, Skeleton, Typography } from 'antd';
import { CalendarDays, UserCheck, UserX, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@oxygen/shared';
import { tokens } from '@oxygen/config';
import { useLocale } from '@/app/use-locale';
import { Money } from '@/components/money';
import type { FrontDeskSummary } from '../front-desk.api';

function Stat({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    // على الموبايل 2×2، وعلى الكمبيوتر صف واحد
    <Flex align="center" gap={12} style={{ flex: '1 1 140px', minWidth: 130 }}>
      <span
        aria-hidden
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: tokens.color.mist,
          color: tokens.color.primary,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div>
        <Typography.Text strong style={{ display: 'block', fontSize: 22, lineHeight: 1.2 }}>
          {value}
        </Typography.Text>
        <Typography.Text type="secondary">{label}</Typography.Text>
      </div>
    </Flex>
  );
}

/** شريط أرقام اليوم (D-02): المواعيد · وصلوا · مجوش · اتحصّل */
export function TodayStats({ summary }: { summary: FrontDeskSummary | undefined }) {
  const { t } = useTranslation('frontDesk');
  const locale = useLocale();
  const n = (value: number) => formatNumber(value, locale);

  return (
    <Card styles={{ body: { padding: '16px 20px' } }} style={{ marginBottom: 24 }}>
      {summary ? (
        <Flex wrap gap={16} role="group" aria-label={t('today.statsLabel')}>
          <Stat
            icon={<CalendarDays size={20} />}
            value={n(summary.appointments)}
            label={t('today.appointments')}
          />
          <Stat
            icon={<UserCheck size={20} />}
            value={n(summary.checked_in)}
            label={t('today.checkedIn')}
          />
          <Stat icon={<UserX size={20} />} value={n(summary.no_shows)} label={t('today.noShows')} />
          <Stat
            icon={<Wallet size={20} />}
            value={<Money amount={summary.collected} />}
            label={t('today.collected')}
          />
        </Flex>
      ) : (
        <Skeleton active paragraph={false} />
      )}
    </Card>
  );
}
