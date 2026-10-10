import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { OfflineNotice } from '@/components/shared/offline-notice';

// الـLayout المشترك لكل صفحات الموقع التعريفي
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('nav');

  // الـFooter دايمًا في آخر الشاشة، حتى لو الصفحة قصيرة (main بياخد المساحة الفاضية)
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only rounded-md bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
      >
        {t('skipToContent')}
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <OfflineNotice />
    </div>
  );
}
