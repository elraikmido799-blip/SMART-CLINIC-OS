import { lazy, Suspense } from 'react';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { LoadingState } from '@/components/states/states';
import type { Role } from '@/features/auth/permissions';
import { useMe } from '@/features/auth/use-me';

/**
 * الرئيسية = أول شاشة الدور (05 §3 · docs/20 · 2.2)، في نفس الـURL `/` من غير تحويل، والقايمة معلّمة على "الرئيسية".
 * كل شاشة بتتحمّل لوحدها لما دورها يطلبها (10.3): الموظف مبيحمّلش كود شاشات أدوار تانية.
 */
const TodayBoard = lazy(() =>
  import('@/features/front-desk/components/today-board').then((m) => ({ default: m.TodayBoard })),
);
const QueuePage = lazy(() =>
  import('@/features/front-desk/components/queue-page').then((m) => ({ default: m.QueuePage })),
);
const DoctorDayPage = lazy(() =>
  import('@/features/doctor-day/components/doctor-day-page').then((m) => ({
    default: m.DoctorDayPage,
  })),
);
const CrmPage = lazy(() =>
  import('@/features/crm/components/crm-page').then((m) => ({ default: m.CrmPage })),
);
const CampaignsPage = lazy(() =>
  import('@/features/crm/components/campaigns-page').then((m) => ({ default: m.CampaignsPage })),
);
const InvoicesPage = lazy(() =>
  import('@/features/billing/components/invoices-page').then((m) => ({ default: m.InvoicesPage })),
);
const ExecutivePage = lazy(() =>
  import('@/features/dashboards/components/executive-page').then((m) => ({
    default: m.ExecutivePage,
  })),
);
const BranchPage = lazy(() =>
  import('@/features/dashboards/components/branch-page').then((m) => ({ default: m.BranchPage })),
);

const DOCTOR_ROLES = new Set<Role>(['doctor', 'nutritionist', 'physiotherapist']);

export const Route = createFileRoute('/_app/')({
  staticData: { nav: 'home' },
  component: HomePage,
});

function Home({ role }: { role: Role }) {
  if (role === 'reception') return <TodayBoard />;
  if (role === 'assistant') return <QueuePage />;
  if (DOCTOR_ROLES.has(role)) return <DoctorDayPage />;
  if (role === 'crm_agent') return <CrmPage />;
  if (role === 'marketing') return <CampaignsPage />;
  if (role === 'finance') return <InvoicesPage />;
  if (role === 'ceo') return <ExecutivePage />;
  if (role === 'admin') return <Navigate to="/settings" replace />;
  // مدير الفرع ومدير العمليات
  return <BranchPage />;
}

function HomePage() {
  const me = useMe();
  return (
    <Suspense fallback={<LoadingState />}>
      <Home role={me.role} />
    </Suspense>
  );
}
