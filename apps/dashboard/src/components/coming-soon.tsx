import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import type { NavKey } from './layout/nav-items';
import { PageHeader } from './page-header';
import { EmptyState } from './states/states';

/** مكان شاشة لسه متبنتش: اسم القسم + رقم خطوتها في docs/20 */
export function ComingSoon({ nav, step }: { nav: NavKey; step: string }) {
  const { t } = useTranslation();
  const { t: tNav } = useTranslation('nav');
  return (
    <>
      <PageHeader title={tNav(nav)} />
      <Card>
        <EmptyState
          title={t('states.comingSoonTitle')}
          description={t('states.comingSoonBody', { step })}
        />
      </Card>
    </>
  );
}
