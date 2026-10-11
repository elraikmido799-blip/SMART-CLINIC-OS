'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { isSpecialty, type Specialty } from '@oxygen/config';
import type { BookingMode } from '@/types/booking';
import type { BookingCatalog } from './catalog';

export type StepId = 'service' | 'branch' | 'time' | 'details' | 'confirm';

const CLINIC_STEPS: StepId[] = ['service', 'branch', 'time', 'details', 'confirm'];
// الأونلاين من غير فرع
const ONLINE_STEPS: StepId[] = ['service', 'time', 'details', 'confirm'];

// كل اللي في الـURL (?mode=&specialty=&service=&branch=&doctor=&date=&slot=&with=&program=&step=)
type Params = {
  mode?: string;
  specialty?: string;
  service?: string;
  branch?: string;
  doctor?: string;
  date?: string;
  slot?: string;
  with?: string;
  program?: string;
  step?: string;
};
type ParamKey = keyof Params;
const KEYS: ParamKey[] = [
  'mode',
  'specialty',
  'service',
  'branch',
  'doctor',
  'date',
  'slot',
  'with',
  'program',
  'step',
];

/**
 * حالة الحجز كلها في الـURL (16 · 5.1): الـRefresh وزرار الرجوع بيشتغلوا، واللينك ينفع يتبعت.
 * الخطوة بتتحسب: مينفعش تفتح خطوة قبل ما اللي قبلها يكمل (لو حد فتح ?step=confirm من غير ميعاد بيرجع للميعاد).
 * التغيير بـhistory.pushState (Next بيزامنه مع useSearchParams) من غير ما الصفحة تتحمل تاني.
 */
export function useBookingState(catalog: BookingCatalog, isSignedIn: boolean) {
  const searchParams = useSearchParams();
  const raw = useMemo(() => {
    const params: Params = {};
    for (const key of KEYS) params[key] = searchParams.get(key) ?? undefined;
    return params;
  }, [searchParams]);

  const mode: BookingMode = raw.mode === 'online' ? 'online' : 'clinic';
  const steps = mode === 'online' ? ONLINE_STEPS : CLINIC_STEPS;

  // الحاجات اللي في الـURL بتتقبل بس لو موجودة في الداتا
  const service =
    mode === 'clinic' ? catalog.services.find((item) => item.slug === raw.service) : undefined;
  const program = catalog.programs.find((item) => item.slug === raw.program);
  const requestedSpecialty: Specialty | undefined =
    raw.specialty && isSpecialty(raw.specialty) ? raw.specialty : undefined;
  const doctor = catalog.doctors.find((item) => item.slug === raw.doctor);
  const specialty: Specialty | undefined =
    service?.specialty ??
    requestedSpecialty ??
    doctor?.specialty ??
    program?.specialty ??
    undefined;
  const onlineOption =
    mode === 'online' ? catalog.online.find((item) => item.specialty === specialty) : undefined;

  const branchDoctors = (branchId: string) =>
    catalog.doctors.filter(
      (item) => item.specialty === specialty && item.branch_ids.includes(branchId),
    );
  const branchCandidate = catalog.branches.find((item) => item.slug === raw.branch);
  const branch =
    mode === 'clinic' &&
    branchCandidate &&
    (!specialty || branchDoctors(branchCandidate.id).length > 0) &&
    (!doctor || doctor.branch_ids.includes(branchCandidate.id))
      ? branchCandidate
      : undefined;
  // الدكتور لازم يبقى من نفس التخصص (ولو فيه فرع، بيشتغل فيه)
  const chosenDoctor =
    doctor &&
    (!specialty || doctor.specialty === specialty) &&
    (!branch || doctor.branch_ids.includes(branch.id))
      ? doctor
      : undefined;
  const slotDoctor = catalog.doctors.find((item) => item.slug === (raw.with ?? chosenDoctor?.slug));
  const slot = raw.slot && slotDoctor ? raw.slot : undefined;

  const done: Record<StepId, boolean> = {
    service: mode === 'online' ? Boolean(onlineOption) : Boolean(service),
    branch: mode === 'online' || Boolean(branch),
    time: Boolean(slot),
    details: isSignedIn,
    confirm: false,
  };
  const firstMissing = steps.find((step) => !done[step]) ?? 'confirm';
  const requested = steps.includes(raw.step as StepId) ? (raw.step as StepId) : firstMissing;
  const step = steps.indexOf(requested) <= steps.indexOf(firstMissing) ? requested : firstMissing;

  /** يغيّر حاجات في الـURL. push = خطوة جديدة في الـHistory (زرار الرجوع يرجعلها). */
  const update = useCallback(
    (patch: Partial<Record<ParamKey, string | undefined>>, options: { push?: boolean } = {}) => {
      const next = new URLSearchParams(window.location.search);
      // الخطوة بتتثبت في الـURL مع أي تغيير: من غيرها الخطوة بتتحسب "أول حاجة ناقصة"،
      // فاختيار الميعاد كان بيودّي على "بياناتك" لوحده من غير "كمّل" (L-58)
      if (!('step' in patch)) next.set('step', step);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      }
      const url = `${window.location.pathname}?${next.toString()}`;
      if (options.push) {
        window.history.pushState(null, '', url);
        document.getElementById('booking-top')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.history.replaceState(null, '', url);
      }
    },
    [step],
  );

  return {
    mode,
    steps,
    step,
    done,
    specialty,
    service,
    branch,
    // الفرع اللي في الـURL حتى لو مش مناسب للتخصص الحالي (عشان لما الخدمة تتغير نشوف ينفع ولا لأ)
    branchSlug: raw.branch,
    doctor: chosenDoctor,
    slotDoctor: slot ? slotDoctor : undefined,
    date: raw.date,
    slot,
    program,
    onlineOption,
    update,
    goTo: (target: StepId) => update({ step: target }, { push: true }),
  };
}

export type BookingState = ReturnType<typeof useBookingState>;
