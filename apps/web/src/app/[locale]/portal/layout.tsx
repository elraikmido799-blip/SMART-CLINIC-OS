import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ClientMessages } from '@/components/client-messages';
import { OfflineNotice } from '@/components/shared/offline-notice';
import { PortalShell } from './_components/portal-shell';

// البوابة مش بتظهر في جوجل (16 · 7.1)
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('portal');
  return {
    title: { default: t('title'), template: `%s · ${t('title')}` },
    robots: { index: false, follow: false },
  };
}

/**
 * بوابة المريض (المرحلة 6): Layout لوحده من غير Navbar وFooter الموقع (PP-01).
 * كل الصفحات Client (داتا المريض من RTK Query)، والـGuard جوه PortalShell.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientMessages namespaces={['portal', 'slotPicker', 'bookingDetails', 'otp', 'signInGate']}>
      <PortalShell>{children}</PortalShell>
      <OfflineNotice />
    </ClientMessages>
  );
}
