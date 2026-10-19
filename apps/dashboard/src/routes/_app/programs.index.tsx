import { createFileRoute, Link } from '@tanstack/react-router';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/states/states';
import { useCan } from '@/features/auth/use-me';

// البرامج: لوحة المرضى حسب المرحلة (D-19 · docs/20 · 5.2). لحد ما تتبني فيه مدخل بنّاء البرامج (5.1)
export const Route = createFileRoute('/_app/programs/')({
  staticData: { nav: 'programs' },
  component: ProgramsHome,
});

function ProgramsHome() {
  const { t } = useTranslation('programs');
  const { t: tNav } = useTranslation('nav');
  const canManage = useCan('builders.manage', 'programs.read');

  return (
    <>
      <PageHeader title={tNav('programs')} />
      <Card>
        <EmptyState
          title={t('soon.title')}
          description={t('soon.body')}
          action={canManage ? <Link to="/programs/builder">{t('manage.title')}</Link> : undefined}
        />
      </Card>
    </>
  );
}
