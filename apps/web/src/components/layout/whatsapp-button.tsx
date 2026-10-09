import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/whatsapp';

// زرار واتساب العايم في كل صفحات الموقع (A3). الـSheet بيغطيه لما القايمة تتفتح
export async function WhatsAppButton() {
  const t = await getTranslations('whatsapp');

  return (
    <a
      href={whatsappUrl(t('defaultMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('floatingLabel')}
      className="fixed end-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:end-6 sm:bottom-6"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
