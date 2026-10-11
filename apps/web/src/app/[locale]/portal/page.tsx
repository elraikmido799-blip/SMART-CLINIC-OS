import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OverviewView } from './_components/overview-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal.nav');
  return { title: t('overview') };
}

// الملخص PP-01 (16 · 6.1)
export default function PortalPage() {
  return <OverviewView />;
}
