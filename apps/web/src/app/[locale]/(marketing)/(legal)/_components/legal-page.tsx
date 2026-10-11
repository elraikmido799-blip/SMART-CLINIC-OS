import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { CalendarDays } from 'lucide-react';
import { formatDate, isLocale, localized } from '@oxygen/shared';
import { getLegalPage } from '@/api/public/legal';
import { Container } from '@/components/shared/container';
import { MarkdownBody } from '@/components/shared/markdown-body';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LEGAL_SLUGS, type LegalSlug } from '@/types/public';

export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const locale = await getLocale();
  const page = await getLegalPage(slug);
  if (!page.ok || !isLocale(locale)) return {};
  return { title: localized(page.data, 'title', locale) };
}

/**
 * Template الصفحات القانونية W-18: الكلام Markdown من الداشبورد + "آخر تحديث".
 * جنبه (فوقه على الموبايل) لينكات الصفحات القانونية كلها، والحالية مختارة.
 * children = أي حاجة زيادة تحت الكلام (فورم حذف الحساب).
 */
export async function LegalPage({
  slug,
  children,
}: {
  slug: LegalSlug;
  children?: React.ReactNode;
}) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('legal');
  const page = await getLegalPage(slug);

  if (!page.ok) {
    if (page.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={page.error} />
      </Container>
    );
  }

  const title = localized(page.data, 'title', locale);

  return (
    <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_220px] lg:gap-14 lg:py-14">
      <nav aria-label={t('navLabel')} className="lg:order-last">
        <p className="text-sm font-semibold text-muted-foreground">{t('navLabel')}</p>
        <ul className="mt-2 flex flex-wrap gap-2 lg:sticky lg:top-24 lg:flex-col lg:gap-1">
          {LEGAL_SLUGS.map((item) => {
            const active = item === slug;
            return (
              <li key={item}>
                <Link
                  href={`/${item}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors lg:w-full lg:rounded-md lg:border-0 lg:px-3',
                    active
                      ? 'border-primary bg-primary text-primary-foreground lg:bg-mist lg:text-primary'
                      : 'border-border bg-card text-ink hover:border-primary hover:text-primary lg:bg-transparent',
                  )}
                >
                  {t(`pages.${item}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <article aria-labelledby="legal-title" className="min-w-0">
        <PageBreadcrumb items={[{ label: title }]} />
        <h1 id="legal-title" className="mt-4 font-heading text-4xl font-bold text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden />
          {t('updated')}{' '}
          <time dateTime={page.data.updated_at}>{formatDate(page.data.updated_at, locale)}</time>
        </p>
        <div className="mt-8 border-t border-border pt-8">
          <MarkdownBody markdown={localized(page.data, 'body', locale)} />
        </div>
        {children}
      </article>
    </Container>
  );
}
