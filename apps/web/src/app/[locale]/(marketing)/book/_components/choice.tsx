import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * كارت الاختيار في خطوات الحجز (A7): أبيض بحدود رفيعة، والمختار حدوده Teal وعليه علامة صح فوق.
 * الكارت كله زرار (أو فيه زرار ممدود على الكارت كله لو جواه لينك تاني).
 */
export const choiceCardClass = (selected: boolean) =>
  cn(
    'relative rounded-2xl border bg-card p-4 text-start transition-[border-color,box-shadow] has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/50',
    selected
      ? 'border-primary shadow-[0_0_0_1px_var(--color-primary)]'
      : 'border-border hover:border-primary/60 hover:shadow-sm',
  );

// الزرار اللي بيغطي الكارت كله (Stretched)، عشان أي حتة في الكارت تختار
export const stretchedButtonClass =
  'text-start after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none';

export function SelectedCheck({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute end-3 top-3 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
      <Check className="size-4" aria-hidden />
    </span>
  );
}
