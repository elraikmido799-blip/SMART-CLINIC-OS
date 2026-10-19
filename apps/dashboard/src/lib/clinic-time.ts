/**
 * الوقت بتوقيت مصر (الفروع كلها في مصر)، مهما كان توقيت جهاز الموظف.
 * المواعيد جاية من الـAPI ISO (`2026-10-19T14:30:00+03:00`).
 */
export const CLINIC_TIME_ZONE = 'Africa/Cairo';

const partsOf = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
};

/** النهارده في مصر: "2026-10-19" */
export const clinicToday = (now = new Date()) => partsOf(now).date;

/** الدقايق من نص الليل بتوقيت مصر (14:30 ← 870) */
export const clinicMinutes = (iso: string | Date) =>
  partsOf(typeof iso === 'string' ? new Date(iso) : iso).minutes;

export const clinicNowMinutes = () => clinicMinutes(new Date());

/** فرق توقيت مصر في يوم معيّن ("+03:00" في الصيفي، "+02:00" في الشتوي) */
export function clinicOffset(date: string): string {
  const noon = new Date(`${date}T12:00:00Z`);
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone: CLINIC_TIME_ZONE, timeZoneName: 'shortOffset' })
      .formatToParts(noon)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+2';
  const hours = Number(name.replace('GMT', '') || 0);
  return `${hours >= 0 ? '+' : '-'}${String(Math.abs(hours)).padStart(2, '0')}:00`;
}

/** "2026-10-19" + 870 دقيقة ← "2026-10-19T14:30:00+03:00" */
export function clinicIso(date: string, minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${date}T${hh}:${mm}:00${clinicOffset(date)}`;
}

/** "2026-10-19" + 3 ← "2026-10-22" */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** أول الأسبوع (السبت — الأسبوع في مصر بيبدأ السبت) */
export function weekStart(date: string): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = الحد … 6 = السبت
  return addDays(date, -((day + 1) % 7));
}

/** تاريخ الميعاد بتوقيت مصر من الـISO ("2026-10-19T14:30:00+03:00" ← "2026-10-19") */
export const clinicDateOf = (iso: string) => iso.slice(0, 10);
