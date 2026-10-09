import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { OfflineNotice } from '@/components/shared/offline-notice';

// الـLayout المشترك لكل صفحات الموقع التعريفي
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('nav');

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-md bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
      >
        {t('skipToContent')}
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton />
      <OfflineNotice />
    </>
  );
}
