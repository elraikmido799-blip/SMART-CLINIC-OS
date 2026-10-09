import { getLocale, getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { isLocale, localized } from '@oxygen/shared';
import type { PublicResult } from '@/api/public/fetch-public';
import { brandButton } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { ParticleRingImage } from '@/components/shared/particle-ring-image';
import { whatsappUrl } from '@/lib/whatsapp';
import type { HomeContent, PublicBranch, PublicSpecialty } from '@/types/public';
import { BookingBar } from './booking-bar';

// لو المحتوى فشل، الصورة الافتراضية اللي في المشروع بتظهر (DEC-25)
const DEFAULT_HERO_IMAGE = '/images/home/hero.png';

type HeroProps = {
  content: PublicResult<HomeContent>;
  specialties: PublicResult<PublicSpecialty[]>;
  branches: PublicResult<PublicBranch[]>;
};

// الـHero (A1 · A3). العنوان والصورة من غير Fade عشان الـLCP (DEC-13)
export async function Hero({ content, specialties, branches }: HeroProps) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('hero');
  const tWhatsapp = await getTranslations('whatsapp');
  const heroImage = content.ok ? content.data.hero_image_url : DEFAULT_HERO_IMAGE;

  const specialtyOptions = specialties.ok
    ? specialties.data.map((item) => ({ value: item.slug, label: localized(item, 'name', locale) }))
    : [];
  const branchOptions = branches.ok
    ? branches.data.map((item) => ({ value: item.slug, label: localized(item, 'name', locale) }))
    : [];

  return (
    <section aria-labelledby="hero-title" className="overflow-hidden">
      <Container className="grid items-center gap-8 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-x-12 lg:py-16">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1
            id="hero-title"
            className="font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-6xl"
          >
            {t('title')}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">{t('subtitle')}</p>
        </div>

        <ParticleRingImage
          src={heroImage}
          alt={t('imageAlt')}
          sizes="(min-width: 1024px) 40vw, 90vw"
          preload
          className="mx-auto w-full max-w-md lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-xl"
        />

        <div className="space-y-4 lg:col-start-1 lg:row-start-2 lg:self-start">
          <BookingBar specialties={specialtyOptions} branches={branchOptions} />
          <a
            href={whatsappUrl(tWhatsapp('defaultMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className={brandButton({ tone: 'outline', className: 'w-full sm:w-auto' })}
          >
            <MessageCircle aria-hidden />
            {tWhatsapp('cta')}
          </a>
        </div>
      </Container>
    </section>
  );
}
