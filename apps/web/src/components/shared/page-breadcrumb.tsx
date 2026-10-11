import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Crumb = { label: string; href?: string };

// مسار الصفحة (A4): "الرئيسية" دايمًا أوله، وآخر عنصر هو الصفحة الحالية من غير لينك.
// onDark: على خلفية التدرّج (صفحة التطبيق) الكلام أبيض
export async function PageBreadcrumb({
  items,
  onDark = false,
}: {
  items: Crumb[];
  onDark?: boolean;
}) {
  const t = await getTranslations('breadcrumb');
  const crumbs: Crumb[] = [{ label: t('home'), href: '/' }, ...items];

  return (
    <Breadcrumb aria-label={t('label')}>
      <BreadcrumbList className={cn('text-sm', onDark && 'text-white/85')}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={crumb.label}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className={cn('font-medium', onDark ? 'text-white' : 'text-ink')}>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className={onDark ? 'hover:text-white' : 'hover:text-primary'}
                  >
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
