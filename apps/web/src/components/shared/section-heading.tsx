import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeading({ id, eyebrow, title, subtitle, className }: SectionHeadingProps) {
  return (
    // تحت 992px العناوين في النص، وفوقها من البداية (L-35)
    <div className={cn('mx-auto max-w-2xl text-center lg:mx-0 lg:text-start', className)}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="font-heading text-3xl font-bold text-ink sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
