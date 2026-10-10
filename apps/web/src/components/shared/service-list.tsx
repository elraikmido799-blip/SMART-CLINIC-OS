import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Clock } from 'lucide-react';
import { formatMoney, isLocale, localized } from '@oxygen/shared';
import { Link } from '@/i18n/navigation';
import type { PublicService } from '@/types/public';

type ServiceListItem = Omit<PublicService, 'specialty'>;

// الخدمات بالمدة و"يبدأ من" (A4 · A5). كل صف بيودّي لصفحة الخدمة
export async function ServiceList({ services }: { services: ServiceListItem[] }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('serviceList');

  return (
    <ul className="space-y-3">
      {services.map((service) => (
        <li key={service.id}>
          <Link
            href={`/services/${service.slug}`}
            className="group flex min-h-11 items-center gap-4 rounded-lg border border-border bg-card p-4 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{localized(service, 'name', locale)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-4" aria-hidden />
                  {t('duration', { minutes: service.duration_minutes })}
                </span>
                <span className="font-semibold text-primary">
                  {t('price', {
                    price: formatMoney(service.price_from_minor, service.currency, locale),
                  })}
                </span>
              </p>
            </div>
            <ArrowRight
              className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
