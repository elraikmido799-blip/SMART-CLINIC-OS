import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { CalendarCheck, FileHeart, FolderOpen, ReceiptText } from 'lucide-react';
import { ClientMessages } from '@/components/client-messages';
import { Container } from '@/components/shared/container';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginView } from './_components/login-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');
  return { title: t('title'), robots: { index: false, follow: false } };
}

// اللي هيلاقيه في البوابة (نفس أقسام المرحلة 6)
const PERKS = [
  { key: 'appointments', icon: CalendarCheck },
  { key: 'passport', icon: FileHeart },
  { key: 'documents', icon: FolderOpen },
  { key: 'invoices', icon: ReceiptText },
] as const;

/**
 * الدخول W-17 (16 · 5.3): الفورم في ناحية، وفي الناحية التانية "هتلاقي إيه في البوابة" على الـMist.
 * من غير باسورد: رقم الموبايل + كود (PhoneOtpForm المشترك مع الحجز).
 */
export default async function LoginPage() {
  const t = await getTranslations('login');

  return (
    <section className="py-10 lg:py-16">
      <Container className="grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <ClientMessages namespaces={['login', 'otp']}>
            <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
              <LoginView />
            </Suspense>
          </ClientMessages>
        </div>

        <aside
          aria-labelledby="perks-title"
          className="relative overflow-hidden rounded-2xl bg-mist p-8 sm:p-10"
        >
          <Image
            src="/images/shared/logo-symbol.png"
            alt=""
            width={160}
            height={160}
            className="pointer-events-none absolute -end-6 -top-6 size-40 opacity-30"
          />
          <h2 id="perks-title" className="relative font-heading text-2xl font-bold text-ink">
            {t('perksTitle')}
          </h2>
          <ul className="relative mt-6 space-y-5">
            {PERKS.map((perk) => (
              <li key={perk.key} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary">
                  <perk.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-ink">
                    {t(`perks.${perk.key}.title`)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t(`perks.${perk.key}.body`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </Container>
    </section>
  );
}
