'use client';

import { motion } from 'motion/react';
import { drawLine, fadeUp, popIn, stepsStagger } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type JourneyStep = { number: string; title: string; body: string };

/**
 * خطوات Secret Seven: النقط بتظهر ورا بعض والخط المنقط بيترسم بينهم، وآخر خطوة بتقفل حلقة (A2 · A3).
 * تحت 992px بالطول وفي نص الصفحة، وفوقها بالعرض.
 */
export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <motion.ol
      className="mx-auto grid max-w-md gap-6 lg:max-w-none lg:grid-cols-7 lg:gap-2"
      variants={stepsStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.number}
            className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center"
          >
            {/* الخط المنقط اللي بيوصل الخطوة باللي بعدها: بيكبر من أوله */}
            {!isLast && (
              <motion.span
                aria-hidden
                variants={drawLine}
                className="absolute start-6 top-12 h-[calc(100%-1.5rem)] origin-top border-s-2 border-dotted border-primary/50 lg:start-[calc(50%+1.75rem)] lg:top-6 lg:h-0 lg:w-[calc(100%-3rem)] lg:origin-left lg:border-s-0 lg:border-t-2 rtl:lg:origin-right"
              />
            )}
            <motion.span
              variants={popIn}
              className={cn(
                'relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-background font-heading text-lg font-bold text-ink',
                isLast
                  ? 'border-[3px] border-dotted border-brand-to'
                  : 'border-2 border-dotted border-primary',
              )}
            >
              {step.number}
            </motion.span>
            <motion.div variants={fadeUp} className="pt-2 lg:pt-0">
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </motion.div>
          </li>
        );
      })}
    </motion.ol>
  );
}
