import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Clock } from 'lucide-react';
import { formatDate, isLocale, localized } from '@oxygen/shared';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { PublicArticle } from '@/types/public';
import { specialtyIcon, specialtyStyles } from './brand';

/**
 * كارت المقالة (W-13): الغلاف (أو لون التخصص وأيقونته لحد ما الأغلفة توصل) + التخصص + العنوان + الملخص.
 * الكارت كله بيفتح المقالة (DEC-34).
 */
export async function ArticleCard({ article }: { article: PublicArticle }) {
  const locale = await getLocale();
  if (!isLocale(locale)) return null;
  const t = await getTranslations('articles');
  const tSpecialty = await getTranslations('specialtyNames');
  const styles = specialtyStyles[article.specialty];
  const title = localized(article, 'title', locale);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50">
      <div className={cn('relative grid aspect-[16/9] place-items-center', styles.tint)}>
        {article.cover_url ? (
          <Image
            src={article.cover_url}
            alt=""
            fill
            sizes="(min-width: 992px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Image
            src={specialtyIcon(article.specialty)}
            alt=""
            width={72}
            height={72}
            className="size-16 opacity-80 transition-transform group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className={cn('flex items-center gap-2 text-sm font-semibold', styles.text)}>
          <span className={cn('size-2 rounded-full', styles.dot)} aria-hidden />
          {tSpecialty(article.specialty)}
        </p>
        <h3 className="mt-2 font-heading text-lg leading-snug font-bold text-ink group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">
          {localized(article, 'excerpt', locale)}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" aria-hidden />
            {t('readingTime', { minutes: article.reading_minutes })}
            <span aria-hidden>·</span>
            <time dateTime={article.published_at}>{formatDate(article.published_at, locale)}</time>
          </span>
          <Link
            href={`/learn/${article.slug}`}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold text-primary after:absolute after:inset-0 focus-visible:outline-none"
          >
            {t('read')}
            <span className="sr-only"> — {title}</span>
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
