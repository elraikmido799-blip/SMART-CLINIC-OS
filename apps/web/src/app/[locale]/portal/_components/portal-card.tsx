import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PortalCardProps = {
  id: string;
  title: string;
  icon: LucideIcon;
  // لينك "شوف الكل" أو أي زرار صغير جنب العنوان
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** كارت في البوابة (PP-01): أيقونة + عنوان صغير فوق، والمحتوى تحته. */
export function PortalCard({
  id,
  title,
  icon: Icon,
  action,
  className,
  children,
}: PortalCardProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn('flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-2 font-semibold text-ink">
          <Icon className="size-5 text-primary" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </section>
  );
}
