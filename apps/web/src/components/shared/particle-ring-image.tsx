import Image from 'next/image';
import { cn } from '@/lib/utils';

// الحلقة مقصوصة مربع مركزه هو مركز الفتحة، والفتحة قطرها 63% من المربع (اتقاس من الصورة)
const RING_SRC = '/images/shared/particle-ring.png';
const HOLE_INSET = '18.5%';
// أي دكتور ملوش صورة (L-48): أيقونة منقطة جوه دايرة Mist، فبتملا فتحة الحلقة
const DEFAULT_AVATAR = '/images/doctors/default.png';

type ParticleRingImageProps = {
  // الصورة بتتغير من الداشبورد (DEC-25)، فممكن تكون مفرّغة أو بخلفية، أو null (= الصورة الافتراضية)
  src: string | null;
  alt: string;
  // المقاس اللي بيتعرض بيه (لـnext/image)
  sizes: string;
  preload?: boolean;
  className?: string;
  // حركة على الحلقة بس (مش الصورة)، زي motion-safe:animate-breathe في الـHero
  ringClassName?: string;
  // contain: للأيقونات (زي أيقونة التخصص لما مفيش صورة)، عشان متتقصّش
  fit?: 'cover' | 'contain';
};

/** أي صورة جوه حلقة النقط (A0). النقط اللي بتتفرق بتروح ناحية الكلام، وبتتعكس في العربي */
export function ParticleRingImage({
  src,
  alt,
  sizes,
  preload,
  className,
  ringClassName,
  fit = 'cover',
}: ParticleRingImageProps) {
  return (
    <div className={cn('relative aspect-square', className)}>
      <div className="absolute overflow-hidden rounded-full bg-mist" style={{ inset: HOLE_INSET }}>
        <Image
          src={src ?? DEFAULT_AVATAR}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className={
            !src
              ? 'scale-125 object-cover'
              : fit === 'cover'
                ? 'object-cover object-top'
                : 'object-contain p-[18%]'
          }
        />
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
