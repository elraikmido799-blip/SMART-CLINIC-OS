import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/shared/container';
import { Logo } from '@/components/shared/logo';
import { StoreBadges } from '@/components/shared/store-badges';

/**
 * شريط التطبيق (A2). التدرّج هنا من Deep Teal لـOcean عشان الكلام الأبيض يبقى مقروء (AA)،
 * لأن الأبيض على الأكوا contrast بتاعه 2.2 بس (DEC-23).
 * البادجات في StoreBadges (مشتركة مع صفحة التطبيق).
 */
export async function AppPromo() {
  const t = await getTranslations('appPromo');

  return (
    <section aria-labelledby="app-promo-title" className="py-14 lg:py-20">
      <Container>
        <div className="relative grid items-center gap-8 overflow-hidden rounded-2xl bg-linear-to-r from-primary to-brand-to px-6 pt-10 text-white sm:px-10 lg:grid-cols-[auto_1fr_auto] lg:gap-12 lg:py-10 rtl:bg-linear-to-l">
          <div className="order-2 mx-auto w-48 self-end sm:w-56 lg:order-none lg:-mb-10 lg:w-60">
            <Image
              src="/images/home/app-phone.png"
              alt={t('phoneAlt')}
              width={1086}
              height={1448}
              sizes="240px"
              className="h-auto w-full"
            />
          </div>

          <div className="flex flex-col items-start gap-4">
            <Logo variant="white" />
            <h2 id="app-promo-title" className="font-heading text-2xl font-bold sm:text-3xl">
              {t('title')}
            </h2>
            <p className="max-w-md text-white/90">{t('body')}</p>
          </div>

          <div className="pb-2 lg:pb-0">
            <StoreBadges />
          </div>
        </div>
      </Container>
    </section>
  );
}
