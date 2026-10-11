import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileView } from '../_components/profile-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal.nav');
  return { title: t('profile') };
}

// PP-08 · 6.8 (16)
export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
      <ProfileView />
    </Suspense>
  );
}
