import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { tokensToCss } from '@oxygen/config';
import { directionOf, isLocale } from '@oxygen/shared';
import { Providers } from '@/components/providers';
import { env } from '@/lib/env';
import { routing } from '@/i18n/routing';
import { alexandria, inter, montserrat, plexArabic } from '@/lib/fonts';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata');
  return {
    // اللينكات الكاملة (صورة المشاركة · canonical) من الدومين اللي في الـenv (16 · 7.1)
    metadataBase: new URL(env.siteUrl),
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
    openGraph: {
      type: 'website',
      siteName: 'Oxygen',
      locale: locale === 'ar' ? 'ar_EG' : 'en_EG',
      alternateLocale: locale === 'ar' ? 'en_EG' : 'ar_EG',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dir = directionOf(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${plexArabic.variable} ${inter.variable} ${montserrat.variable} ${alexandria.variable}`}
    >
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
