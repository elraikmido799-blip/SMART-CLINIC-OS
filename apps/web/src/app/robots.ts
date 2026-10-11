import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// robots.txt (16 · 7.1): كل الموقع مفتوح لجوجل، ما عدا حساب المريض والدفع والدخول
export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/*/portal', '/*/checkout', '/*/login'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
