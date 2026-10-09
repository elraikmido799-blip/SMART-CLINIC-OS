import { getTranslations } from 'next-intl/server';
import { SearchX } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Logo } from '@/components/shared/logo';
import { Link } from '@/i18n/navigation';

// أي لينك مش موجود (ومنهم الصفحات اللي لسه هتتبني في المرحلة 4)
export default async function NotFoundPage() {
  const t = await getTranslations('notFound');

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <SearchX className="mt-6 size-10 text-primary" strokeWidth={1.5} aria-hidden />
      <h1 className="font-heading text-2xl font-bold text-ink">{t('title')}</h1>
      <p className="text-muted-foreground">{t('body')}</p>
      <Link href="/" className={brandButton({ tone: 'primary' })}>
        {t('home')}
      </Link>
    </main>
  );
}
