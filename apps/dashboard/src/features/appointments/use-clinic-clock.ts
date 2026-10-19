import { useEffect, useState } from 'react';
import { clinicNowMinutes, clinicToday } from '@/lib/clinic-time';

/** النهارده والدقيقة دلوقتي بتوقيت مصر، وبيتحدّثوا كل دقيقة (خط "دلوقتي" و"واصلين دلوقتي") */
export function useClinicClock() {
  const read = () => ({ today: clinicToday(), minutes: clinicNowMinutes() });
  const [clock, setClock] = useState(read);

  useEffect(() => {
    const timer = setInterval(() => setClock(read()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return clock;
}
