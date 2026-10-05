import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// بيوجّه أي زائر لـ/ar أو /en
export default createMiddleware(routing);

export const config = {
  // كل الصفحات ما عدا: /api · /trpc · /_next · /_vercel · وأي ملف فيه نقطة (صور، favicon…)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
