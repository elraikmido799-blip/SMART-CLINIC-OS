import { cn } from '@/lib/utils';

export type DottedStep = {
  id: string;
  title: string;
  body?: string;
  // أي حاجة زيادة تحت الخطوة (زي "هتاخد إيه" في مراحل البرنامج)
  extra?: React.ReactNode;
};

/**
 * خطوات مرقّمة بالطول: دواير منقطة متوصلة بخط منقط، زي Secret Seven (A0 · A2).
 * بتستخدم في "هتلاقي إيه" (صفحة الخدمة) ومراحل البرنامج. آخر خطوة بتقفل بلون الأوشن لو closing.
 */
export function DottedSteps({ steps, closing }: { steps: DottedStep[]; closing?: boolean }) {
  return (
    <ol>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className="absolute start-[1.125rem] top-10 bottom-1 border-s-2 border-dotted border-primary/40"
              />
            )}
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full bg-card text-sm font-bold text-primary',
                closing && isLast
                  ? 'border-[3px] border-dotted border-brand-to'
                  : 'border-2 border-dotted border-primary',
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-1.5">
              <p className={cn('text-base text-ink', step.body && 'font-semibold')}>{step.title}</p>
              {step.body && <p className="mt-1 text-base text-muted-foreground">{step.body}</p>}
              {step.extra}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
