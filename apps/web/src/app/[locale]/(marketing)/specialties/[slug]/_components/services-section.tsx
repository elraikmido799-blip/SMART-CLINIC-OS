import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { Container } from '@/components/shared/container';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { ServiceList } from '@/components/shared/service-list';
import { Link } from '@/i18n/navigation';
import type { PublicProgram, PublicSpecialtyDetail } from '@/types/public';

type ServicesSectionProps = {
  specialty: PublicSpecialtyDetail;
  programs: PublicResult<PublicProgram[]>;
};

// الخدمات بالمدة والسعر + البرنامج الأونلاين بتاع التخصص جنبها (A4)
export async function ServicesSection({ specialty, programs }: ServicesSectionProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('specialtyPage');
  // لو البرامج فشلت، الكارت بيستخبى والخدمات بتكمل
  const program = programs.ok
    ? programs.data.find((item) => item.specialty === specialty.slug)
    : undefined;

  return (
    <section aria-labelledby="services-title" className="py-12 lg:py-16">
      <Container className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <SectionHeading id="services-title" title={t('servicesTitle')} />
          <div className="mt-6">
            {specialty.services.length === 0 ? (
              <SectionState state="empty" />
            ) : (
              <ServiceList services={specialty.services} />
            )}
          </div>
        </div>

        {program && (
          <aside
            aria-labelledby="related-program-title"
            className="relative overflow-hidden rounded-2xl border border-border bg-mist p-6 lg:mt-14"
          >
            <p className="text-sm font-semibold text-primary">{t('relatedProgram')}</p>
            <h3
              id="related-program-title"
              className="mt-1 font-heading text-2xl font-bold text-ink"
            >
              {localized(program, 'name', locale)}
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {(locale === 'ar' ? program.features_ar : program.features_en).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {program.image_url && (
              <Image
                src={program.image_url}
                alt=""
                width={1536}
                height={1024}
                sizes="(min-width: 992px) 30vw, 90vw"
                className="mt-4 h-auto w-full"
              />
            )}
            <Link
              href={`/programs/${program.slug}`}
              className="mt-2 inline-flex h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {t('learnMore')}
              <span className="sr-only"> — {localized(program, 'name', locale)}</span>
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          </aside>
        )}
      </Container>
    </section>
  );
}
