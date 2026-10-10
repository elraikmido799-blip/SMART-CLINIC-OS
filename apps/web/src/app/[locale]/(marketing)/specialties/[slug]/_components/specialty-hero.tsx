import { getLocale, getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import { brandButton, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { ParticleRingImage } from '@/components/shared/particle-ring-image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';
import type { PublicSpecialtyDetail } from '@/types/public';

// الـHero بلون التخصص الفاتح (A4). العنوان والصورة من غير Fade عشان الـLCP (DEC-13)
export async function SpecialtyHero({ specialty }: { specialty: PublicSpecialtyDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('specialtyPage');
  const tNav = await getTranslations('nav');
  const tWhatsapp = await getTranslations('whatsapp');
  const name = localized(specialty, 'name', locale);
  const styles = specialtyStyles[specialty.slug];

  return (
    <section aria-labelledby="specialty-title" className="pt-4 lg:pt-6">
      <Container>
        <div
          className={cn(
            'grid items-center gap-8 overflow-hidden rounded-2xl border px-5 py-8 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:py-10',
            styles.tint,
            styles.border,
          )}
        >
          <div className="text-center lg:text-start">
            <div className="flex justify-center lg:justify-start">
              <PageBreadcrumb
                items={[{ label: tNav('specialties'), href: '/specialties' }, { label: name }]}
              />
            </div>
            <h1
              id="specialty-title"
              className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-6xl"
            >
              {name}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
              {localized(specialty, 'tagline', locale)}
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={{ pathname: '/book', query: { specialty: specialty.slug } }}
                className={brandButton({ tone: 'gold', size: 'lg' })}
              >
                {t('bookAssessment')}
              </Link>
              <a
                href={whatsappUrl(tWhatsapp('defaultMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className={brandButton({ tone: 'outline', size: 'lg' })}
              >
                <MessageCircle aria-hidden />
                {tWhatsapp('cta')}
              </a>
            </div>
          </div>

          {/* مفيش صورة لسه = أيقونة التخصص المنقطة جوه الحلقة */}
          <ParticleRingImage
            src={specialty.hero_image_url ?? specialty.icon_url}
            fit={specialty.hero_image_url ? 'cover' : 'contain'}
            alt={specialty.hero_image_url ? name : ''}
            sizes="(min-width: 992px) 36vw, 320px"
            preload
            className="order-first mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:max-w-md"
            ringClassName="motion-safe:animate-breathe"
          />
        </div>
      </Container>
    </section>
  );
}
