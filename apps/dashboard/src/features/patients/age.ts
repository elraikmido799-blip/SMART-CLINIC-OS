// العمر بالسنين من تاريخ الميلاد
export function ageOf(birthDate: string, today: string) {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}
