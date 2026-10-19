import { useEffect, useState } from 'react';

/** القيمة بعد ما المستخدم يوقف كتابة (البحث مش بيبعت طلب مع كل حرف) */
export function useDebounced<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
