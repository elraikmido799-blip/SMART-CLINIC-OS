import { useEffect, useState } from 'react';

/** الوقت دلوقتي (ms) وبيتحدّث كل `ms` (عدّاد الـSLA والأيام بتتحدّث من غير Refresh) */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return now;
}
