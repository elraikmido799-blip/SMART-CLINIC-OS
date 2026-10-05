import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';

// Inter مفيهوش حروف عربي، فالإنجليزي بيطلع بـInter والعربي بـIBM Plex Sans Arabic في نفس السطر (globals.css)
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
});
