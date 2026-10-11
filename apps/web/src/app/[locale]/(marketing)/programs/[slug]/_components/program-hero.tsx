import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { isLocale, localized } from '@oxygen/shared';
import { specialtyIcon, specialtyStyles } from '@/components/shared/brand';
import { Container } from '@/components/shared/container';
import { PageBreadcrumb } from '@/components/shared/page-breadcrumb';
import { cn } from '@/lib/utils';
import type { PublicProgramDetail } from '@/types/public';

/**
 * رأس صفحة البرنامج: بلون التخصص الفاتح (زي A4)، وSecret Seven على الـMist لأنه بيجمع أكتر من تخصص.
 * الصورة: صورة البرنامج لو موجودة (Physio Home)، وإلا أيقونة التخصص، وإلا رمز Oxygen.
 */
export async function ProgramHero({ program }: { program: PublicProgramDetail }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const tNav = await getTranslations('nav');
  const name = localized(program, 'name', locale);
  const styles = program.specialty ? specialtyStyles[program.specialty] : null;

  return (
    <section aria-labelledby="program-title" className="pt-4 lg:pt-6">
      <Container>
        <div
          className={cn(
            'grid items-center gap-6 overflow-hidden rounded-2xl border px-5 py-8 text-center sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:py-10 lg:text-start',
            styles ? [styles.tint, styles.border] : 'border-border bg-mist',
          )}
        >
          <div>
            <div className="flex justify-center lg:justify-start">
              <PageBreadcrumb
                items={[{ label: tNav('programs'), href: '/programs' }, { label: name }]}
              />
            </div>
            <h1
              id="program-title"
              className="mt-4 font-heading text-4xl leading-tight font-bold text-ink sm:text-5xl"
            >
              {name}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground lg:mx-0">
              {localized(program, 'summary', locale)}
            </p>
          </div>
          {program.image_url ? (
            <Image
              src={program.image_url}
              alt=""
              width={1536}
              height={1024}
              sizes="(min-width: 992px) 36vw, 90vw"
              preload
              className="mx-auto h-auto w-full max-w-md"
            />
          ) : (
            <Image
              src={
                program.specialty
                  ? specialtyIcon(program.specialty)
                  : '/images/shared/logo-symbol.png'
              }
              alt=""
              width={160}
              height={160}
              className="order-first mx-auto size-24 sm:size-32 lg:order-none lg:size-40"
            />
          )}
        </div>
      </Container>
    </section>
  );
}
