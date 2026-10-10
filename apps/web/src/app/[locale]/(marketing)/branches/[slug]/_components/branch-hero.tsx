import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowUpRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { formatTime, isLocale, localized } from '@oxygen/shared';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { Link } from '@/i18n/navigation';
import { mapsEmbedUrl } from '@/lib/maps';
import { whatsappUrl } from '@/lib/whatsapp';
import type { PublicBranchDetail } from '@/types/public';

/**
 * رأس صفحة الفرع: العنوان والمواعيد + الحجز (الدهبي الوحيد) والاتصال والواتساب والاتجاهات + الخريطة.
 * الخريطة iframe بيتحمّل لما الزائر يوصل له (loading=lazy) زي الرئيسية (DEC-28).
 */
export async function BranchHero({ branch }: { branch: PublicBranchDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('branchPage');
  const tNav = await getTranslations('nav');
  const tBranches = await getTranslations('branches');
  const tWhatsapp = await getTranslations('whatsapp');
  const name = localized(branch, 'name', locale);
  const fullName = t('name', { name });
  const hours = tBranches('hours', {
    opens: formatTime(branch.opens_at, locale),
    closes: formatTime(branch.closes_at, locale),
  });

  return (
    <section aria-labelledby="branch-title" className="pt-4 lg:pt-6">
      <Container className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
        <div className="text-center lg:text-start">
          <div className="flex justify-center lg:justify-start">
            <PageBreadcrumb
              items={[{ label: tNav('branches'), href: '/branches' }, { label: name }]}
            />
          </div>
          <h1
            id="branch-title"
            className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
          >
            {fullName}
          </h1>
          <ul className="mt-5 flex flex-col items-center gap-2 text-base text-ink lg:items-start">
            <li className="flex items-center gap-2">
              <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
              {localized(branch, 'address', locale)}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-5 shrink-0 text-primary" aria-hidden />
              {t('hours')} · {hours}
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Link
              href={{ pathname: '/book', query: { branch: branch.slug } }}
              className={brandButton({ tone: 'gold', size: 'lg' })}
            >
              {t('book')}
            </Link>
            <a
              href={branch.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={brandButton({ tone: 'outline', size: 'lg' })}
            >
              {t('directions')}
              <ArrowUpRight className="rtl:-scale-x-100" aria-hidden />
            </a>
            {branch.phone && (
              <a
                href={`tel:${branch.phone}`}
                className={brandButton({ tone: 'outline', size: 'lg' })}
              >
                <Phone aria-hidden />
                <span dir="ltr">{branch.phone}</span>
                <span className="sr-only">{t('call')}</span>
              </a>
            )}
            <a
              href={whatsappUrl(tWhatsapp('defaultMessage'), branch.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={brandButton({ tone: 'outline', size: 'lg' })}
            >
              <MessageCircle aria-hidden />
              {tWhatsapp('cta')}
            </a>
          </div>
        </div>

        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-mist">
          <iframe
            src={mapsEmbedUrl(branch.latitude, branch.longitude, locale)}
            title={tBranches('mapTitle', { branch: name })}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        </div>
      </Container>
    </section>
  );
}
