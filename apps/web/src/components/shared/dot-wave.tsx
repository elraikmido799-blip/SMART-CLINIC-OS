import Image from 'next/image';
import { cn } from '@/lib/utils';

// موجة النقط بين الأقسام (A0). زينة بس، فمالهاش alt
export function DotWave({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none relative h-8 w-full sm:h-12', className)}>
      <Image
        src="/images/shared/dot-wave.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover rtl:-scale-x-100"
      />
    </div>
  );
}
