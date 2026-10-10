import { getLocale, getTranslations } from 'next-intl/server';
import { Clock, MapPin, ReceiptText } from 'lucide-react';
import { formatMoney, isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { brandButton } from '@/components/shared/brand';
import { Link } from '@/i18n/navigation';
import type { PublicBranch, PublicServiceDetail } from '@/types/public';

type ServiceBookingCardProps = {
  service: PublicServiceDetail;
  branches: PublicResult<PublicBranch[]>;
};

/**
 * كارت الحجز (زي ملخص الحجز في A6): المدة والسعر والفروع + زرار الحجز الدهبي (الوحيد في الصفحة).
 * Sticky على الكمبيوتر، وعلى الموبايل بيظهر بعد الـHero على طول.
 * أيقونة إيصال جنب السعر مش $ (مراجعة A6).
 */
export async function ServiceBookingCard({ service, branches }: ServiceBookingCardProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('servicePage');
  // لو الفروع فشلت، الكارت بيكمل من غير قايمة الفروع
  const serviceBranches = branches.ok
    ? branches.data.filter((branch) => service.branch_ids.includes(branch.id))
    : [];

  return (
    <aside
      aria-label={t('bookCta')}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <dl className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            <Clock className="size-5" aria-hidden />
          </span>
          <div>
            <dt className="text-sm text-muted-foreground">{t('duration')}</dt>
            <dd className="font-semibold text-ink">
              {t('durationValue', { minutes: service.duration_minutes })}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-primary">
            <ReceiptText className="size-5" aria-hidden />
          </span>
          <div>
            <dt className="text-sm text-muted-foreground">{t('priceFrom')}</dt>
            <dd className="font-semibold text-ink">
              {formatMoney(service.price_from_minor, service.currency, locale)}
            </dd>
          </div>
        </div>
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">{t('priceNote')}</p>

      <Link
        href={{ pathname: '/book', query: { service: service.slug } }}
        className={brandButton({ tone: 'gold', size: 'lg', block: true, className: 'mt-5' })}
      >
        {t('bookCta')}
      </Link>

      {serviceBranches.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h2 className="text-sm font-semibold text-ink">{t('branches')}</h2>
          <ul className="mt-2">
            {serviceBranches.map((branch) => (
              <li key={branch.id} className="flex min-h-11 items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-ink">
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                  {localized(branch, 'name', locale)}
                </span>
                <a
                  href={branch.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center text-sm font-semibold text-primary hover:underline"
                >
                  {t('directions')}
                  <span className="sr-only"> — {localized(branch, 'name', locale)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
