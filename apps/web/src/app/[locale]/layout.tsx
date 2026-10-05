import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { tokensToCss } from '@oxygen/config';
import { directionOf, isLocale } from '@oxygen/shared';
import { Providers } from '@/components/providers';
import { routing } from '@/i18n/routing';
import { inter, plexArabic } from '@/lib/fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dir = directionOf(locale);

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${inter.variable}`}>
      <head>
        {/* ألوان Oxygen من packages/config — المصدر الوحيد للموقع والداشبورد */}
        <style dangerouslySetInnerHTML={{ __html: tokensToCss() }} />
      </head>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider>
          <Providers dir={dir}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
