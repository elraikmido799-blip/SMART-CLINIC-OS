import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
  // زرار أو لينك (مثلًا "احجز موعد")
  action?: React.ReactNode;
  className?: string;
};

/**
 * الحالة الفاضية (16 · 6): أيقونة جوه دايرة منقطة بلون الهوية + جملة + زرار يودّي للخطوة الجاية.
 * لما رسومات الحالات (2.10) تيجي، الأيقونة بتتبدل بالصورة.
 */
export function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid size-20 place-items-center rounded-full border-[3px] border-dotted border-primary/40 bg-mist">
        <Icon className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-4 font-heading text-xl font-bold text-ink">{title}</h2>
      {body && <p className="mt-1 max-w-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
