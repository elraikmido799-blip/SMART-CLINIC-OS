import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Clock, Info, ShieldCheck } from 'lucide-react';
import { formatDate, isLocale, localized } from '@oxygen/shared';
import { getArticle, getArticles } from '@/api/public/articles';
import { getDoctors } from '@/api/public/doctors';
import { ArticleCard } from '@/components/shared/article-card';
import { BookingBanner } from '@/components/shared/booking-banner';
import { specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { MarkdownBody } from '@/components/shared/markdown-body';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const RELATED_LIMIT = 3;

// المقالات بتتبني وقت الـBuild، والجديدة من الداشبورد أول ما حد يفتحها (DEC-32)
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.ok ? articles.data.map((article) => ({ slug: article.slug })) : [];
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/learn/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getArticle(slug);
  if (!result.ok) return {};
  return {
    title: localized(result.data, 'title', locale),
    description: localized(result.data, 'excerpt', locale),
    openGraph: { type: 'article', publishedTime: result.data.published_at },
  };
}

/**
 * صفحة المقالة W-13: العنوان + "راجعها د. …" (ثقة طبية) + الكلام (Markdown) + تنبيه إن المقالة مش بديل للكشف
 * + مقالات من نفس التخصص + شريط الحجز بالتخصص.
 */
export default async function ArticlePage({ params }: PageProps<'/[locale]/learn/[slug]'>) {
  const { slug } = await params;
  const [article, articles, doctors] = await Promise.all([
    getArticle(slug),
    getArticles(),
    getDoctors(),
  ]);

  if (!article.ok) {
    if (article.error === 'not-found') notFound();
    return (
      <Container className="py-16">
        <SectionState state={article.error} />
      </Container>
    );
  }

  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('articlePage');
  const tLearn = await getTranslations('learnPage');
  const tArticles = await getTranslations('articles');
  const tSpecialty = await getTranslations('specialtyNames');
  const data = article.data;
  const styles = specialtyStyles[data.specialty];
  const title = localized(data, 'title', locale);
  // لو الأطباء فشلوا أو الدكتور اتشال، السطر بيستخبى
  const reviewer =
    data.reviewed_by && doctors.ok
      ? doctors.data.find((doctor) => doctor.slug === data.reviewed_by)
      : undefined;
  const related = articles.ok
    ? articles.data
        .filter((item) => item.specialty === data.specialty && item.slug !== data.slug)
        .slice(0, RELATED_LIMIT)
    : [];

  return (
    <>
      <article aria-labelledby="article-title" className="pt-6 pb-10 lg:pt-10">
        <Container className="max-w-3xl">
          <PageBreadcrumb items={[{ label: tLearn('title'), href: '/learn' }, { label: title }]} />
          <Link
            href={{ pathname: '/learn', query: { specialty: data.specialty } }}
            className={cn(
              'mt-6 inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold',
              styles.text,
              styles.border,
              styles.tint,
            )}
          >
            <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
            {tSpecialty(data.specialty)}
          </Link>
          <h1
            id="article-title"
            className="mt-4 font-heading text-3xl leading-tight font-bold text-ink sm:text-4xl lg:text-5xl"
          >
            {title}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">{localized(data, 'excerpt', locale)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {tArticles('readingTime', { minutes: data.reading_minutes })}
              <span aria-hidden>·</span>
              <time dateTime={data.published_at}>{formatDate(data.published_at, locale)}</time>
            </span>
            {reviewer && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                {t.rich('reviewedBy', {
                  doctor: () => (
                    <Link
                      href={`/doctors/${reviewer.slug}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {localized(reviewer, 'name', locale)}
                    </Link>
                  ),
                })}
              </span>
            )}
          </div>

          {data.cover_url && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-mist">
              <Image
                src={data.cover_url}
                alt=""
                fill
                preload
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-8">
            <MarkdownBody markdown={localized(data, 'body', locale)} />
          </div>

          <p className="mt-10 flex gap-3 rounded-lg bg-mist p-4 text-sm text-ink">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            {t('disclaimer')}
          </p>
        </Container>
      </article>

      {related.length > 0 && (
        <>
          <DotWave />
          <Reveal>
            <section aria-labelledby="related-title" className="py-12 lg:py-16">
              <Container>
                <SectionHeading id="related-title" title={t('related')} />
                <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {related.map((item) => (
                    <RevealItem key={item.id}>
                      <ArticleCard article={item} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Container>
            </section>
          </Reveal>
        </>
      )}

      <BookingBanner
        title={t('bannerTitle', { specialty: tSpecialty(data.specialty) })}
        cta={t('bannerCta')}
        bookQuery={{ specialty: data.specialty }}
      />
    </>
  );
}
