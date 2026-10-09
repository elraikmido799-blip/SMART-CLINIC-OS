import { cva } from 'class-variance-authority';
import type { Specialty } from '@oxygen/config';

/**
 * زراير الهوية (A0): الدهبي لزرار الحجز الأساسي بس، والتيل للباقي، والـOutline للتاني.
 * بتتحط على <Button> أو على <Link> بـasChild. الارتفاع 44px على الأقل (قاعدة UX).
 */
export const brandButton = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        gold: 'bg-gold text-ink hover:bg-gold/90',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-primary bg-card text-primary hover:bg-mist',
        onDark: 'border border-white/70 text-white hover:bg-white/10',
      },
      size: {
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { tone: 'primary', size: 'md' },
  },
);

// الكلاسات لازم تبقى مكتوبة كاملة عشان Tailwind يشوفها. الـtint فوق أبيض مش رملي: كده الكلام الصغير بلون التخصص contrast بتاعه 4.7 (AA)
export const specialtyStyles: Record<
  Specialty,
  { text: string; tint: string; border: string; dot: string }
> = {
  nutrition: {
    text: 'text-nutrition',
    tint: 'bg-card bg-linear-to-b from-nutrition/5 to-nutrition/5',
    border: 'border-nutrition/20',
    dot: 'bg-nutrition',
  },
  physio: {
    text: 'text-physio',
    tint: 'bg-card bg-linear-to-b from-physio/5 to-physio/5',
    border: 'border-physio/20',
    dot: 'bg-physio',
  },
  derm: {
    text: 'text-derm',
    tint: 'bg-card bg-linear-to-b from-derm/5 to-derm/5',
    border: 'border-derm/20',
    dot: 'bg-derm',
  },
  internal: {
    text: 'text-internal',
    tint: 'bg-card bg-linear-to-b from-internal/5 to-internal/5',
    border: 'border-internal/20',
    dot: 'bg-internal',
  },
};

// أيقونات التخصصات المنقطة (I1 — DEC-27)
export const specialtyIcon = (specialty: Specialty) => `/images/specialties/${specialty}.png`;
