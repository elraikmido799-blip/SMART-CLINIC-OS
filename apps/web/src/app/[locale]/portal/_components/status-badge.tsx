import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Status =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'unpaid'
  | 'refunded'
  | 'active'
  | 'expired'
  | 'finished';

// اللون بيوضّح الحالة، والكلمة نفسها مكتوبة (مش اللون بس — a11y)
const TONES: Record<Status, string> = {
  confirmed: 'bg-mist text-primary',
  active: 'bg-mist text-primary',
  // الأخضر على أخضر فاتح contrast قليل (axe) — الكلام كحلي
  paid: 'bg-success/15 text-ink',
  completed: 'bg-muted text-muted-foreground',
  finished: 'bg-muted text-muted-foreground',
  pending_payment: 'bg-warning/15 text-ink',
  unpaid: 'bg-warning/15 text-ink',
  cancelled: 'bg-destructive/10 text-ink',
  expired: 'bg-destructive/10 text-ink',
  refunded: 'bg-muted text-ink',
};

/** حالة الحجز أو الفاتورة أو الباقة (شيب صغير) */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations('portal.status');
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold',
        TONES[status],
        className,
      )}
    >
      {t(status)}
    </span>
  );
}
