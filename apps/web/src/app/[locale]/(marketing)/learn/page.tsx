import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SearchX } from 'lucide-react';
import { isSpecialty } from '@oxygen/config';
import { getArticles } from '@/api/public/articles';
import { ArticleCard } from '@/components/shared/article-card';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionState } from '@/components/shared/section-state';
import { SpecialtyChips } from '@/components/shared/specialty-chips';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('learnPage');
  return { title: t('title'), description: t('metaDescription') };
}

/**
 * المقالات W-13: فلتر بالتخصص في الـURL (زي الأطباء — DEC-33) + كروت، الأحدث الأول.
 * الأغلفة بتظهر لما توصل (16 · 2.9)، ولحد كده الكارت بلون التخصص وأيقونته.
 */
export default async function LearnPage({ searchParams }: PageProps<'/[locale]/learn'>) {
  const t = await getTranslations('learnPage');
  const params = await searchParams;
  const specialty = isSpecialty(params.specialty) ? params.specialty : undefined;
  const articles = await getArticles();
  const filtered = articles.ok
    ? articles.data.filter((article) => !specialty || article.specialty === specialty)
    : [];

  return (
    <section aria-labelledby="learn-title" className="py-10 lg:py-16">
      <Container>
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1 id="learn-title" className="font-heading text-4xl font-bold text-ink sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mt-8">
          <SpecialtyChips
            pathname="/learn"
            active={specialty}
            label={t('filterLabel')}
            allLabel={t('all')}
          />
        </div>

        <div className="mt-8">
          {!articles.ok ? (
            <SectionState state={articles.error} />
          ) : articles.data.length === 0 ? (
            <SectionState state="empty" />
          ) : filtered.length === 0 ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center"
            >
              <SearchX className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
              <p className="font-semibold text-ink">{t('noMatch')}</p>
              <Link href="/learn" scroll={false} className={brandButton({ tone: 'outline' })}>
                {t('clearFilter')}
              </Link>
            </div>
          ) : (
            <>
              {/* الكروت عناوينها h3، فلازم h2 قبلها عشان ترتيب العناوين (Lighthouse a11y — L-62) */}
              <h2 className="sr-only">{t('listTitle')}</h2>
              {/* الـkey بيتغير مع الفلتر عشان الكروت تظهر تاني (P-18) */}
              <RevealGroup
                key={specialty ?? 'all'}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {filtered.map((article) => (
                  <RevealItem key={article.id}>
                    <ArticleCard article={article} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
