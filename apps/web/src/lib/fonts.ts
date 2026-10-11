import { Alexandria, IBM_Plex_Sans_Arabic, Inter, Montserrat } from 'next/font/google';

// Inter و Montserrat مفيهمش حروف عربي، فالعربي في نفس السطر بيطلع بالخط العربي اللي بعدهم (globals.css)
// الخطوط العربي مش بتتعمل لها preload: كانت 4 ملفات (~140 KB) بتتحمّل بأولوية عالية في كل صفحة حتى الإنجليزي،
// وبتزاحم الـCSS وصورة الـHero (L-62). في الصفحات العربي بتتحمّل من الـCSS على طول، والكلام بيظهر (swap) من غير ما يستنى

// الكلام العادي
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  preload: false,
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
});

// العناوين: Geometric عريض زي كلمة OXYGEN في اللوجو (DEC-29)
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading-latin',
});

export const alexandria = Alexandria({
  subsets: ['arabic'],
  weight: ['600', '700'],
  variable: '--font-heading-arabic',
  preload: false,
});
