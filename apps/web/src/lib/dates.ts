// التواريخ والمواعيد بتوقيت مصر (Africa/Cairo)، مهما كان توقيت جهاز الزائر.
// مصر فيها توقيت صيفي (+03:00) وشتوي (+02:00)، فالـoffset بيتحسب لكل يوم.
const TIME_ZONE = 'Africa/Cairo';

// "YYYY-MM-DD" (en-CA بيكتب التاريخ بالشكل ده)
const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

/** النهارده بتوقيت مصر "YYYY-MM-DD" */
export const todayInCairo = () => dateFormatter.format(new Date());

/** اليوم بتاع أي ميعاد ISO بتوقيت مصر */
export const cairoDateOf = (iso: string) => dateFormatter.format(new Date(iso));

/** "2026-10-11" + 3 ← "2026-10-14" */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** رقم اليوم (0 = الحد … 6 = السبت) */
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

/** فرق توقيت مصر في اليوم ده: "+03:00" أو "+02:00" */
export function cairoOffset(date: string): string {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value;
  const match = name?.match(/GMT([+-]\d{2}):?(\d{2})?/);
  return match ? `${match[1]}:${match[2] ?? '00'}` : '+02:00';
}

/** "2026-10-12" + "17:30" ← "2026-10-12T17:30:00+03:00" */
export const cairoIso = (date: string, hhmm: string) => `${date}T${hhmm}:00${cairoOffset(date)}`;

/** الساعة (0–23) بتوقيت مصر لميعاد ISO */
export function cairoHourOf(iso: string): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(iso)),
  );
}

/** الميعاد لسه مجاش؟ */
export const isUpcoming = (iso: string) => new Date(iso).getTime() > Date.now();

/** كام ساعة فاضلة على الميعاد (بالسالب لو فات) */
export const hoursUntil = (iso: string) => (new Date(iso).getTime() - Date.now()) / 3_600_000;

/** "صباح الخير" ولا "مساء الخير" بتوقيت مصر */
export function greetingPeriod(): 'morning' | 'afternoon' | 'evening' {
  const hour = cairoHourOf(new Date().toISOString());
  return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
}
