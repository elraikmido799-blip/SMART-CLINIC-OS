/** بينقل عنصر في مكانه (فوق -1 / تحت +1)، ويسيب القايمة زي ما هي لو في الحد */
export function move<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
