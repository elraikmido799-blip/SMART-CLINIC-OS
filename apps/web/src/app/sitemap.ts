import type { MetadataRoute } from 'next';
import { SPECIALTIES } from '@oxygen/config';
import { LOCALES } from '@oxygen/shared';
import { getArticles } from '@/api/public/articles';
import { getBranches } from '@/api/public/branches';
import { getDoctors } from '@/api/public/doctors';
import { getOffers } from '@/api/public/offers';
import { getPrograms } from '@/api/public/programs';
import { getServices } from '@/api/public/services';
import { LEGAL_SLUGS } from '@/types/public';
import { isOfferActive } from '@/lib/offers';
import { SECRET_SEVEN_SLUG } from '@/lib/programs';
import { absoluteUrl, languageAlternates } from '@/lib/seo';

// بيتبني تاني كل ساعة، عشان الأطباء والمقالات الجديدة من الداشبورد يدخلوا لوحدهم
export const revalidate = 3600;

const STATIC_PATHS = [
  '/',
  '/specialties',
  '/doctors',
  '/branches',
  '/programs',
  '/about',
  '/contact',
  '/learn',
  '/faqs',
  '/online-consultation',
  '/digital',
  '/app',
  '/book',
  ...LEGAL_SLUGS.map((slug) => `/${slug}`),
];

/**
 * sitemap.xml (16 · 7.1): كل الصفحات باللغتين، وكل صفحة معاها نسختها التانية (hreflang).
 * الـslugs من نفس الـAPI بتاع الصفحات. أي Endpoint وقع: صفحاته بس اللي بتتشال من الـsitemap.
 * البوابة والدفع والدخول مش فيه (noindex).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, doctors, branches, programs, articles, offers] = await Promise.all([
    getServices(),
    getDoctors(),
    getBranches(),
    getPrograms(),
    getArticles(),
    getOffers(),
  ]);
  const slugs = <T>(result: { ok: true; data: T[] } | { ok: false }, pick: (item: T) => string) =>
    result.ok ? result.data.map(pick) : [];

  const paths = [
    ...STATIC_PATHS,
    ...SPECIALTIES.map((slug) => `/specialties/${slug}`),
    ...slugs(services, (item) => `/services/${item.slug}`),
    ...slugs(doctors, (item) => `/doctors/${item.slug}`),
    ...slugs(branches, (item) => `/branches/${item.slug}`),
    `/programs/${SECRET_SEVEN_SLUG}`,
    ...slugs(programs, (item) => `/programs/${item.slug}`),
    ...slugs(articles, (item) => `/learn/${item.slug}`),
    ...(offers.ok ? offers.data.filter(isOfferActive).map((item) => `/offers/${item.slug}`) : []),
  ];

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(locale, path),
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/book' ? 0.9 : 0.7,
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
