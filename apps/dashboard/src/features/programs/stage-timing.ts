import type { Enrollment } from './enrollment-types';
import type { ProgramStage } from './types';

const DAY = 86_400_000;

/** أيام المريض في مرحلته الحالية */
export const daysInStage = (enrollment: Pick<Enrollment, 'stage_entered_at'>, now = Date.now()) =>
  Math.max(0, Math.floor((now - Date.parse(enrollment.stage_entered_at)) / DAY));

/** أيام التأخير عن المدة المتوقعة (0 = مش متأخر) */
export const daysLate = (
  enrollment: Pick<Enrollment, 'stage_entered_at'>,
  stage: Pick<ProgramStage, 'expected_days'>,
  now = Date.now(),
) => Math.max(0, daysInStage(enrollment, now) - stage.expected_days);
