import { getTranslations } from 'next-intl/server';
import { Play, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * بادجات المتاجر وهي "قريبًا" (شريط التطبيق في الرئيسية + صفحة التطبيق).
 * علامات المتاجر الرسمية ولينكاتها هتتحط لما التطبيق ينزل.
 */
export async function StoreBadges({ tone = 'onDark' }: { tone?: 'onDark' | 'onLight' }) {
  const t = await getTranslations('appPromo');

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">{t('comingSoon')}</p>
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'appStore', Icon: Smartphone },
          { key: 'googlePlay', Icon: Play },
        ].map(({ key, Icon }) => (
          <span
            key={key}
            aria-disabled
            className={cn(
              'inline-flex h-12 items-center gap-2 rounded-lg px-4 text-sm font-semibold',
              tone === 'onDark'
                ? 'border border-white/40 bg-ink/80 text-white'
                : 'bg-ink text-white opacity-80',
            )}
          >
            <Icon className="size-5" aria-hidden />
            {t(key)}
          </span>
        ))}
      </div>
    </div>
  );
}
