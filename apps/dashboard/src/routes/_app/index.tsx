import { createFileRoute } from '@tanstack/react-router';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/states/states';
import type { Role } from '@/features/auth/permissions';
import { useMe } from '@/features/auth/use-me';

/**
 * الرئيسية = أول شاشة الدور (05 §3 · docs/20 · 2.2)، في نفس الـURL `/` من غير تحويل،
 * والقايمة معلّمة على "الرئيسية". لحد ما كل شاشة تتبني، بيظهر رقم خطوتها.
 */
const HOME_STEP: Record<Role, string> = {
  reception: '3.1',
  doctor: '4.2',
  nutritionist: '4.2',
  physiotherapist: '4.2',
  assistant: '3.4',
  crm_agent: '6.1',
  marketing: '6.4',
  finance: '7.3',
  branch_manager: '8.2',
  operations_manager: '8.2',
  ceo: '8.1',
  admin: '9.3',
};

export const Route = createFileRoute('/_app/')({
  staticData: { nav: 'home' },
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();
  const me = useMe();
  const locale = useLocale();

  return (
    <>
      <PageHeader
        title={t('home.greeting', { name: localized(me, 'name', locale) })}
        description={t(`roles.${me.role}`)}
      />
      <Card>
        <EmptyState
          title={t('states.comingSoonTitle')}
          description={t('states.comingSoonBody', { step: HOME_STEP[me.role] })}
        />
      </Card>
    </>
  );
}
