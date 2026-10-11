import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * مراحل البرنامج (Secret Seven) زي التصميم: اللي خلصت Teal بعلامة صح، والحالية منقطة بالرقم،
 * والجاية منقطة رمادي، وبينهم خط منقط. label للقارئ: "المرحلة 3 من 7".
 */
export function ProgramStages({
  stage,
  total,
  label,
}: {
  stage: number;
  total: number;
  label: string;
}) {
  return (
    <ol aria-label={label} className="flex items-center">
      {Array.from({ length: total }, (_, index) => {
        const number = index + 1;
        const done = number < stage;
        const current = number === stage;
        return (
          <li key={number} className="flex flex-1 items-center last:flex-none">
            <span
              aria-current={current ? 'step' : undefined}
              className={cn(
                'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                done && 'bg-primary text-primary-foreground',
                current && 'border-[3px] border-dotted border-primary bg-card text-primary',
                !done &&
                  !current &&
                  'border-2 border-dotted border-border bg-card text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" aria-hidden /> : number}
            </span>
            {number < total && (
              <span
                aria-hidden
                className={cn(
                  'mx-1 flex-1 border-t-2 border-dotted',
                  done ? 'border-primary' : 'border-border',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
