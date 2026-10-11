'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepId } from './use-booking-state';

type BookingStepperProps = {
  steps: StepId[];
  current: StepId;
  done: Record<StepId, boolean>;
  onGo: (step: StepId) => void;
};

/**
 * خطوات الحجز (A7): دواير منقطة بيوصلها خط منقط. اللي خلصت Teal بعلامة صح وبتتداس للرجوع لها،
 * والحالية دايرة منقطة بالرقم، والجاية رمادي. على الموبايل الأسامي بتستخبى ما عدا الحالية.
 */
export function BookingStepper({ steps, current, done, onGo }: BookingStepperProps) {
  const t = useTranslations('booking.steps');
  const currentIndex = steps.indexOf(current);

  return (
    <nav aria-label={t('label')}>
      <p className="mb-3 text-center text-sm text-muted-foreground sm:hidden">
        {t('counter', { current: currentIndex + 1, total: steps.length })}
      </p>
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isCurrent = step === current;
          const isDone = index < currentIndex && done[step];
          const isLast = index === steps.length - 1;
          const circle = (
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors',
                isDone && 'bg-primary text-primary-foreground',
                isCurrent && 'border-[3px] border-dotted border-primary bg-card text-primary',
                !isDone &&
                  !isCurrent &&
                  'border-2 border-dotted border-border bg-card text-muted-foreground',
              )}
            >
              {isDone ? <Check className="size-5" aria-hidden /> : index + 1}
            </span>
          );
          const label = (
            <span
              className={cn(
                'mt-2 text-center text-xs sm:text-sm',
                isCurrent ? 'font-semibold text-primary' : 'text-ink',
                !isCurrent && 'sr-only sm:not-sr-only',
              )}
            >
              {t(step)}
            </span>
          );
          return (
            <li
              key={step}
              aria-current={isCurrent ? 'step' : undefined}
              className="relative flex flex-1 flex-col items-center"
            >
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute start-[calc(50%+1.5rem)] end-[calc(-50%+1.5rem)] top-5 border-t-2 border-dotted',
                    index < currentIndex ? 'border-primary' : 'border-border',
                  )}
                />
              )}
              {isDone ? (
                <button
                  type="button"
                  onClick={() => onGo(step)}
                  className="flex flex-col items-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {circle}
                  {label}
                  <span className="sr-only">{t('done')}</span>
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  {circle}
                  {label}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
