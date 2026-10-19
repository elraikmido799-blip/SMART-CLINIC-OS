import { Avatar } from 'antd';
import { tokens } from '@oxygen/config';

// "Dr. Omar Hassan" ← "OH" (من غير اللقب). العربي حرف واحد: "هاني مصطفى" ← "ه"
// (حرفين عربي بيتشبكوا ويتقروا كلمة، زي "هم")
const TITLES = new Set(['د.', 'dr.', 'dr']);

function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => !TITLES.has(word.toLowerCase()));
  const arabic = /[\u0600-\u06FF]/.test(name);
  return words
    .slice(0, arabic ? 1 : 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/** صورة الشخص = أول حرفين من اسمه (من غير صور ناس — DEC-41) */
export function PersonAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <Avatar
      size={size}
      style={{
        background: tokens.color.mist,
        color: tokens.color.primary,
        fontWeight: 600,
        flexShrink: 0,
      }}
      aria-hidden
    >
      {initialsOf(name)}
    </Avatar>
  );
}
