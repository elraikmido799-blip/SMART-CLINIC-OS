'use client';

import { useGetMeQuery } from '@/api/auth.api';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingStepper } from './booking-stepper';
import { BookingSummary } from './booking-summary';
import type { BookingCatalog } from './catalog';
import { StepBranch } from './step-branch';
import { StepConfirm } from './step-confirm';
import { StepDetails } from './step-details';
import { StepService } from './step-service';
import { StepTime } from './step-time';
import { useBookingState } from './use-booking-state';

/**
 * الحجز W-07 (A7): الخطوات فوق، والخطوة الحالية، والملخص ثابت جنبها (تحتها على الموبايل).
 * الحالة كلها في الـURL (use-booking-state). "بياناتك" بتعدّي لو المريض داخل.
 */
export function BookingWizard({ catalog }: { catalog: BookingCatalog }) {
  const me = useGetMeQuery();
  const state = useBookingState(catalog, me.isSuccess);
  // لسه بنعرف هو داخل ولا لأ: الخطوات اللي بعد "بياناتك" تستنى بدل ما ترجع لها غلط
  const waitingForMe = me.isLoading && (state.step === 'details' || state.step === 'confirm');

  return (
    <div id="booking-top" className="scroll-mt-24">
      <BookingStepper
        steps={state.steps}
        current={state.step}
        done={state.done}
        onGo={state.goTo}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 rounded-2xl border border-border bg-card/60 p-4 sm:p-8">
          {waitingForMe ? (
            <div className="space-y-4" aria-busy>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : state.step === 'service' ? (
            <StepService catalog={catalog} state={state} />
          ) : state.step === 'branch' ? (
            <StepBranch catalog={catalog} state={state} />
          ) : state.step === 'time' ? (
            <StepTime
              key={`${state.specialty}-${state.branch?.id}`}
              catalog={catalog}
              state={state}
            />
          ) : state.step === 'details' ? (
            <StepDetails state={state} me={me.data} />
          ) : (
            <StepConfirm state={state} />
          )}
        </div>
        <div className="lg:sticky lg:top-24">
          <BookingSummary catalog={catalog} state={state} />
        </div>
      </div>
    </div>
  );
}
