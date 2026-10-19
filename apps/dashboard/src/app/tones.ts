import { tokens, type Specialty } from '@oxygen/config';

/**
 * ألوان الـTags والعلامات الفاتحة (DEC-41): خلفية فاتحة من اللون + كلام غامق من نفس اللون.
 * الكلام الأبيض على أخضر/أزرق/أحمر الحالات contrast بتاعه أقل من 4.5، فممنوع.
 * النسب دي اتفحصت بسكريبت: الكلام على الخلفية 4.9 أو أكتر في كل الألوان (L-66).
 */
const TINT = 0.88; // الخلفية: 12% من اللون
const BORDER_TINT = 0.7;
const SHADE = 0.4; // الكلام: اللون أغمق بـ40%

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
// t = نسبة اللون التاني
const mix = (a: string, b: string, t: number) => {
  const target = toRgb(b);
  return toHex(toRgb(a).map((v, i) => v * (1 - t) + target[i] * t));
};

export type ToneColors = { bg: string; border: string; text: string };

const toneOf = (color: string): ToneColors => ({
  bg: mix(color, '#ffffff', TINT),
  border: mix(color, '#ffffff', BORDER_TINT),
  text: mix(color, '#000000', SHADE),
});

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

const { color } = tokens;

export const TONES: Record<Tone, ToneColors> = {
  success: toneOf(color.success),
  warning: toneOf(color.warning),
  danger: toneOf(color.danger),
  info: toneOf(color.info),
  primary: toneOf(color.primary),
  // الـTags اللي مش حالة (البرنامج، نوع الزيارة، الحملة): رمادي هادي
  neutral: { bg: mix(color.border, '#ffffff', 0.4), border: color.border, text: color.mutedText },
};

export const SPECIALTY_TONES = Object.fromEntries(
  Object.entries(tokens.specialty).map(([key, value]) => [key, toneOf(value)]),
) as Record<Specialty, ToneColors>;
