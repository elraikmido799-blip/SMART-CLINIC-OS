import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import type { Specialty } from '@oxygen/config';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { Link } from '@/i18n/navigation';

/**
 * شريط الحجز في آخر الصفحة (A4). نفس تدرّج شريط التطبيق (Teal → Ocean) عشان الأبيض يبقى AA.
 * الزرار Outline أبيض: الدهبي واحد بس في الصفحة (اللي في الـHero).
 */
export async function BookingBanner({ specialty }: { specialty: Specialty }) {
  const t = await getTranslations('specialtyPage');

  return (
    <section aria-labelledby="booking-banner-title" className="pt-6 pb-14 lg:pb-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-linear-to-r from-primary to-brand-to px-6 py-10 text-center text-white sm:px-10 lg:flex-row lg:gap-10 lg:text-start rtl:bg-linear-to-l">
          <Logo variant="white" />
          <span aria-hidden className="hidden h-12 w-px bg-white/40 lg:block" />
          <h2
            id="booking-banner-title"
            className="flex-1 font-heading text-2xl font-semibold sm:text-3xl"
          >
            {t('bannerTitle')}
          </h2>
          <Link
            href={{ pathname: '/book', query: { specialty } }}
            className={brandButton({ tone: 'onDark', size: 'lg' })}
          >
            {t('bookAssessment')}
            <ArrowRight className="rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}
