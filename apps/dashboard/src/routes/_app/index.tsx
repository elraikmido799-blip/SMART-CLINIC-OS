import { createFileRoute, Navigate } from '@tanstack/react-router';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/states/states';
import type { Role } from '@/features/auth/permissions';
import { useMe } from '@/features/auth/use-me';
import { InvoicesPage } from '@/features/billing/components/invoices-page';
import { CampaignsPage } from '@/features/crm/components/campaigns-page';
import { CrmPage } from '@/features/crm/components/crm-page';
import { BranchPage } from '@/features/dashboards/components/branch-page';
import { ExecutivePage } from '@/features/dashboards/components/executive-page';
import { DoctorDayPage } from '@/features/doctor-day/components/doctor-day-page';
import { QueuePage } from '@/features/front-desk/components/queue-page';
import { TodayBoard } from '@/features/front-desk/components/today-board';

/**
 * الرئيسية = أول شاشة الدور (05 §3 · docs/20 · 2.2)، في نفس الـURL `/` من غير تحويل،
 * والقايمة معلّمة على "الرئيسية". لحد ما كل شاشة تتبني، بيظهر رقم خطوتها.
 */
// الشاشات اللي اتبنت بتظهر هنا مكان رقم الخطوة
const HOME_STEP: Partial<Record<Role, string>> = {
  reception: '3.1',
  assistant: '3.4',
};

const DOCTOR_ROLES = new Set<Role>(['doctor', 'nutritionist', 'physiotherapist']);

export const Route = createFileRoute('/_app/')({
  staticData: { nav: 'home' },
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();
  const me = useMe();
  const locale = useLocale();

  if (me.role === 'reception') return <TodayBoard />;
  if (me.role === 'assistant') return <QueuePage />;
  if (DOCTOR_ROLES.has(me.role)) return <DoctorDayPage />;
  if (me.role === 'crm_agent') return <CrmPage />;
  if (me.role === 'marketing') return <CampaignsPage />;
  if (me.role === 'finance') return <InvoicesPage />;
  if (me.role === 'ceo') return <ExecutivePage />;
  if (me.role === 'admin') return <Navigate to="/settings" replace />;
  if (me.role === 'branch_manager' || me.role === 'operations_manager') return <BranchPage />;

  return (
    <>
      <PageHeader
        title={t('home.greeting', { name: localized(me, 'name', locale) })}
        description={t(`roles.${me.role}`)}
      />
      <Card>
        <EmptyState
          title={t('states.comingSoonTitle')}
          description={t('states.comingSoonBody', { step: HOME_STEP[me.role] ?? '' })}
        />
      </Card>
    </>
  );
}
