import Image from 'next/image';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

// الحلقة مقصوصة مربع مركزه هو مركز الفتحة، والفتحة قطرها 63% من المربع (اتقاس من الصورة)
const RING_SRC = '/images/shared/particle-ring.png';
const HOLE_INSET = '18.5%';

type ParticleRingImageProps = {
  // الصورة بتتغير من الداشبورد (DEC-25)، فممكن تكون مفرّغة أو بخلفية، أو null
  src: string | null;
  alt: string;
  // المقاس اللي بيتعرض بيه (لـnext/image)
  sizes: string;
  preload?: boolean;
  className?: string;
  // حركة على الحلقة بس (مش الصورة)، زي motion-safe:animate-breathe في الـHero
  ringClassName?: string;
};

/** أي صورة جوه حلقة النقط (A0). النقط اللي بتتفرق بتروح ناحية الكلام، وبتتعكس في العربي */
export function ParticleRingImage({
  src,
  alt,
  sizes,
  preload,
  className,
  ringClassName,
}: ParticleRingImageProps) {
  return (
    <div className={cn('relative aspect-square', className)}>
      <div className="absolute overflow-hidden rounded-full bg-mist" style={{ inset: HOLE_INSET }}>
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            className="object-cover object-top"
          />
        ) : (
          <div role="img" aria-label={alt} className="grid size-full place-items-center">
            <UserRound className="size-1/2 text-primary/40" strokeWidth={1.25} />
          </div>
        )}
      </div>
      {/* الحلقة بتتعكس في العربي على الـwrapper عشان الحركة (scale) متلغيش العكس */}
      <div className="pointer-events-none absolute inset-0 rtl:-scale-x-100">
        <Image
          src={RING_SRC}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className={cn('pointer-events-none object-contain', ringClassName)}
        />
      </div>
    </div>
  );
}
