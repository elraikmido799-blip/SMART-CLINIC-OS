import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  // white: على الخلفيات الغامقة والتدرّج
  variant?: 'color' | 'white';
  // horizontal: الرمز + OXYGEN جنب بعض (الـNavbar) · stacked: اللوجو كامل بالجملة اللي تحته
  layout?: 'horizontal' | 'stacked';
  className?: string;
};

// اللوجو ملفات زي ما هي (DEC-24). في الـNavbar الرمز صورة، وكلمة OXYGEN جنبه بالكود (مراجعة A1)
export function Logo({ variant = 'color', layout = 'horizontal', className }: LogoProps) {
  if (layout === 'stacked') {
    return (
      <Image
        src={variant === 'white' ? '/logo-white.png' : '/logo.png'}
        alt="Oxygen — Physical Therapy and Nutrition"
        width={1153}
        height={1061}
        className={cn('h-auto w-32', className)}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/images/shared/logo-symbol.png"
        alt=""
        width={882}
        height={882}
        className={cn('size-11', variant === 'white' && 'brightness-0 invert')}
      />
      <span
        dir="ltr"
        className={cn(
          'font-heading text-base font-semibold tracking-[0.35em] sm:text-lg sm:tracking-[0.45em]',
          variant === 'white' ? 'text-white' : 'text-ink',
        )}
      >
        OXYGEN
      </span>
    </span>
  );
}
