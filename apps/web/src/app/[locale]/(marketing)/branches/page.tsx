import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import { getBranches } from '@/api/public/branches';
import { BranchesMap, type BranchView } from '@/components/shared/branches-map';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { SectionState } from '@/components/shared/section-state';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('branchesPage');
  return { title: t('title'), description: t('metaDescription') };
}

// صفحة الفروع W-06: نفس خريطة الرئيسية (A2)، وكل فرع ليه لينك لصفحته
export default async function BranchesPage() {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('branchesPage');
  const tBranches = await getTranslations('branches');
  const branches = await getBranches();

  const views: BranchView[] = branches.ok
    ? branches.data.map((branch) => ({
        id: branch.id,
        name: localized(branch, 'name', locale),
        hours: tBranches('hours', {
          opens: formatTime(branch.opens_at, locale),
          closes: formatTime(branch.closes_at, locale),
        }),
        mapsUrl: branch.maps_url,
        latitude: branch.latitude,
        longitude: branch.longitude,
        href: `/branches/${branch.slug}`,
      }))
    : [];

  return (
    <section aria-labelledby="branches-page-title" className="py-10 lg:py-16">
      <Container>
        <div className="flex justify-center lg:justify-start">
          <PageBreadcrumb items={[{ label: t('title') }]} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center lg:mx-0 lg:text-start">
          <h1
            id="branches-page-title"
            className="font-heading text-4xl font-bold text-ink sm:text-5xl"
          >
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mt-10">
          {!branches.ok ? (
            <SectionState state={branches.error} />
          ) : views.length === 0 ? (
            <SectionState state="empty" />
          ) : (
            <BranchesMap branches={views} locale={locale} />
          )}
        </div>
      </Container>
    </section>
  );
}
