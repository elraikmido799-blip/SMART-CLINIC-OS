import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { getAboutContent, getHomeContent } from '@/api/public/content';
import { BookingBanner } from '@/components/shared/booking-banner';
import { Container } from '@/components/shared/container';
import { DotWave } from '@/components/shared/dot-wave';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { ParticleRingImage } from '@/components/shared/particle-ring-image';
import { Reveal } from '@/components/shared/reveal';
import { RevealGroup, RevealItem } from '@/components/shared/reveal-group';
import { SectionHeading } from '@/components/shared/section-heading';
import { SectionState } from '@/components/shared/section-state';
import { TrustBar } from '@/components/shared/trust-bar';

// لو المحتوى مفيهوش صورة، صورة الرئيسية (DEC-25)
const DEFAULT_IMAGE = '/images/home/hero.png';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('aboutPage');
  return { title: t('title'), description: t('metaDescription') };
}

/**
 * "عن Oxygen" W-02. مفيش صورة تصميم: نفس قطع الصفحات اللي قبلها (DEC-32).
 * المحتوى لو فشل = رسالة مكان الصفحة. الأرقام لو فشلت بتستخبى (زي الرئيسية).
 */
export default async function AboutPage() {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('aboutPage');
  const [about, home] = await Promise.all([getAboutContent(), getHomeContent()]);

  if (!about.ok) {
    return (
      <Container className="py-16">
        <SectionState state={about.error} />
      </Container>
    );
  }

  const data = about.data;
  const ar = locale === 'ar';
  const story = ar ? data.story_ar : data.story_en;

  return (
    <>
      <section aria-labelledby="about-title" className="overflow-hidden">
        <Container className="grid items-center gap-8 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-14">
          <div className="text-center lg:text-start">
            <div className="flex justify-center lg:justify-start">
              <PageBreadcrumb items={[{ label: t('title') }]} />
            </div>
            <h1
              id="about-title"
              className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-6xl"
            >
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
              {localized(data, 'intro', locale)}
            </p>
          </div>
          <ParticleRingImage
            src={data.hero_image_url ?? DEFAULT_IMAGE}
            alt={t('imageAlt')}
            sizes="(min-width: 992px) 36vw, 320px"
            preload
            className="order-first mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:max-w-md"
            ringClassName="motion-safe:animate-breathe"
          />
        </Container>
      </section>

      <TrustBar content={home} />
      <DotWave className="-mt-4 sm:-mt-6" />

      {/* الحكاية + الرسالة */}
      <Reveal>
        <section aria-labelledby="story-title" className="py-12 lg:py-16">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <SectionHeading id="story-title" title={t('story')} />
              <div className="mx-auto mt-5 max-w-2xl space-y-4 text-center text-lg leading-relaxed text-ink lg:mx-0 lg:text-start">
                {story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
            <figure className="rounded-2xl bg-linear-to-br from-primary to-brand-to p-8 text-center text-white sm:p-10 rtl:bg-linear-to-bl">
              <figcaption className="text-sm font-semibold tracking-[0.2em] text-white/80 uppercase">
                {t('mission')}
              </figcaption>
              <blockquote className="mt-3 font-heading text-2xl leading-snug font-bold sm:text-3xl">
                {localized(data, 'mission', locale)}
              </blockquote>
            </figure>
          </Container>
        </section>
      </Reveal>

      {/* القيم: نقطة مرقّمة منقطة زي خطوات Secret Seven */}
      {data.values.length > 0 && (
        <Reveal>
          <section aria-labelledby="values-title" className="py-12 lg:py-16">
            <Container>
              <SectionHeading id="values-title" title={t('values')} />
              <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {data.values.map((value, index) => (
                  <RevealItem key={value.id}>
                    <div className="flex h-full flex-col items-center rounded-lg border border-border bg-card p-5 text-center lg:items-start lg:text-start">
                      <span className="grid size-10 place-items-center rounded-full border-2 border-dotted border-primary text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <h3 className="mt-4 font-semibold text-ink">
                        {localized(value, 'title', locale)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {localized(value, 'body', locale)}
                      </p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Container>
          </section>
        </Reveal>
      )}

      {data.photos.length > 0 && (
        <Reveal>
          <section aria-labelledby="about-photos-title" className="py-12 lg:py-16">
            <Container>
              <SectionHeading id="about-photos-title" title={t('photos')} />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.photos.map((photo) => (
                  <li
                    key={photo.url}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-mist"
                  >
                    <Image
                      src={photo.url}
                      alt={localized(photo, 'alt', locale)}
                      fill
                      sizes="(min-width: 992px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </Reveal>
      )}

      <BookingBanner title={t('bannerTitle')} cta={t('bannerCta')} bookQuery={{}} />
    </>
  );
}
