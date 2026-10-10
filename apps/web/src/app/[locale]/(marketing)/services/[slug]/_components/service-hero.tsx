import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { cn } from '@/lib/utils';
import type { PublicServiceDetail } from '@/types/public';

// رأس صفحة الخدمة: بلون التخصص الفاتح زي صفحة التخصص (A4)، من غير زرار — الحجز في الكارت اللي جنبه
export async function ServiceHero({ service }: { service: PublicServiceDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const tNav = await getTranslations('nav');
  const tSpecialty = await getTranslations('specialtyNames');
  const styles = specialtyStyles[service.specialty];

  return (
    <section aria-labelledby="service-title" className="pt-4 lg:pt-6">
      <Container>
        <div
          className={cn(
            'flex flex-col items-center gap-5 rounded-2xl border px-5 py-8 text-center sm:px-10 lg:flex-row lg:items-center lg:gap-8 lg:py-10 lg:text-start',
            styles.tint,
            styles.border,
          )}
        >
          <Image
            src={specialtyIcon(service.specialty)}
            alt=""
            width={96}
            height={96}
            className="size-16 sm:size-20 lg:order-last lg:size-24"
          />
          <div className="flex-1">
            <div className="flex justify-center lg:justify-start">
              <PageBreadcrumb
                items={[
                  { label: tNav('specialties'), href: '/specialties' },
                  {
                    label: tSpecialty(service.specialty),
                    href: `/specialties/${service.specialty}`,
                  },
                  { label: localized(service, 'name', locale) },
                ]}
              />
            </div>
            <h1
              id="service-title"
              className="mt-4 font-heading text-3xl leading-tight font-bold text-ink sm:text-4xl lg:text-5xl"
            >
              {localized(service, 'name', locale)}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground lg:mx-0">
              {localized(service, 'summary', locale)}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
