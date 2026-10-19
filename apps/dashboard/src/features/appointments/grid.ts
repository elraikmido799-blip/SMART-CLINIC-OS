// مقاسات كالندر الساعات (TimeGrid) — نفسها في الـMocks (ساعات الشغل)
export const DAY_START = 9 * 60;
export const DAY_END = 21 * 60;
export const SLOT_MIN = 15;
export const PX_PER_MIN = 1.4; // ساعة = 84px

// 870 ← "14:30"
export const toHHmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

// كل ربع ساعة من أول اليوم لآخره (اختيار الساعة في الحجز وقفل الوقت)
export const SLOTS = Array.from(
  { length: (DAY_END - DAY_START) / SLOT_MIN },
  (_, index) => DAY_START + index * SLOT_MIN,
);
