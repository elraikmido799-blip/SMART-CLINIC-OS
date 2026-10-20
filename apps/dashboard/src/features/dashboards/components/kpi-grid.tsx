import type { ReactNode } from 'react';
import {
  Banknote,
  CalendarDays,
  Package,
  UserMinus,
  UserPlus,
  Users,
  UserRoundSearch,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { StatCard } from '@/components/stat-card';
import type { Kpi, KpiKey } from '../types';

const ICONS: Record<KpiKey, ReactNode> = {
  patients: <Users size={20} />,
  new_patients: <UserPlus size={20} />,
  new_leads: <UserRoundSearch size={20} />,
  appointments: <CalendarDays size={20} />,
  no_shows: <UserMinus size={20} />,
  revenue: <Banknote size={20} />,
  packages_sold: <Package size={20} />,
};

// الزيادة وحشة في الـNo-shows بس
const GOOD_WHEN: Record<KpiKey, 'up' | 'down'> = {
  patients: 'up',
  new_patients: 'up',
  new_leads: 'up',
  appointments: 'up',
  no_shows: 'down',
  revenue: 'up',
  packages_sold: 'up',
};

/**
 * أرقام الداشبورد (docs/05 §5) في شبكة كروت: كل كارت بسهم بيمشي مع الرقم (طالع لو زاد) ولونه حسب كويس ولا وحش،
 * وجنبه "مقارنة بالفترة اللي قبلها". الـNo-shows جنبها نسبتها من المواعيد (No-show ÷ المواعيد).
 */
export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  const { t } = useTranslation('dashboards');
  const locale = useLocale();
  const appointments = kpis.find((item) => item.key === 'appointments')?.value ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: 16,
        marginBottom: 16,
      }}
    >
      {kpis.map((kpi) => {
        const change = kpi.previous
          ? Math.round(((kpi.value - kpi.previous) / kpi.previous) * 100)
          : 0;
        const value =
          kpi.key === 'revenue'
            ? formatMoney(kpi.value, 'EGP', locale)
            : kpi.key === 'no_shows' && appointments
              ? `${formatNumber(kpi.value, locale)} (${formatNumber(
                  Math.round((kpi.value / appointments) * 1000) / 10,
                  locale,
                )}%)`
              : formatNumber(kpi.value, locale);
        return (
          <StatCard
            key={kpi.key}
            icon={ICONS[kpi.key]}
            label={t(`kpi.${kpi.key}`)}
            value={value}
            trend={{ change, goodWhen: GOOD_WHEN[kpi.key], label: t('vsPrevious') }}
          />
        );
      })}
    </div>
  );
}
