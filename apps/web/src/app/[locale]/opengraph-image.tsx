import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { tokens } from '@oxygen/config';

// صورة المشاركة (واتساب · فيسبوك · لينكدإن) لكل صفحات الموقع — 16 · 7.1
export const alt = 'Oxygen — Physical Therapy and Nutrition';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * تدرّج الهوية (Teal ← Ocean) واللوجو الأبيض في النص. الجملة بالإنجليزي بس:
 * خط الصورة (next/og) مفيهوش عربي، فالنسخة العربي لوجو من غير كلام.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const logo = await readFile(join(process.cwd(), 'public/logo-white.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        backgroundImage: `linear-gradient(120deg, ${tokens.color.primary}, ${tokens.color.brandTo})`,
        color: 'white',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og بيحتاج <img> عادي */}
      <img src={logoSrc} alt="" width={300} height={276} />
      {locale !== 'ar' && (
        <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -0.5 }}>
          A new breath for your health.
        </div>
      )}
    </div>,
    size,
  );
}
