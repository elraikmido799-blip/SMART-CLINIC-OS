import { getLocale, getTranslations } from 'next-intl/server';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import type { PublicBranch } from '@/types/public';
import { BranchesMap, type BranchView } from './branches-map';

// الفروع (A2) على Google Maps (DEC-28)
export async function BranchesSection({ branches }: { branches: PublicResult<PublicBranch[]> }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('branches');

  const views: BranchView[] = branches.ok
    ? branches.data.map((branch) => ({
        id: branch.id,
        name: localized(branch, 'name', locale),
        hours: t('hours', {
          opens: formatTime(branch.opens_at, locale),
          closes: formatTime(branch.closes_at, locale),
        }),
        mapsUrl: branch.maps_url,
        latitude: branch.latitude,
        longitude: branch.longitude,
      }))
    : [];

  return (
    <section aria-labelledby="branches-title" className="py-14 lg:py-20">
      <Container>
        <SectionHeading id="branches-title" title={t('title')} subtitle={t('subtitle')} />
        <div className="mt-8">
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
