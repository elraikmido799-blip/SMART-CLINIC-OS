import { useEffect, useRef, useState } from 'react';

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

/**
 * حفظ تلقائي بعد ما المستخدم يبطّل تعديل بـ`ms`. `save` بترجّع وقت الحفظ (ISO).
 * `schedule(value)` بعد كل تعديل، و`flush(value)` لحفظ فوري. لو الحفظ فشل التعديلات بتفضل في الشاشة.
 */
export function useAutosave<T>(
  save: (value: T) => Promise<string | null>,
  initialSavedAt: string | null = null,
  ms = 1500,
) {
  const [state, setState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // آخر `save` (عشان الـTimer ميمسكش نسخة قديمة منها)
  const latest = useRef(save);
  useEffect(() => {
    latest.current = save;
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  const flush = async (value: T) => {
    clearTimeout(timer.current);
    setState('saving');
    try {
      setSavedAt(await latest.current(value));
      setState('saved');
    } catch {
      setState('error');
    }
  };

  const schedule = (value: T) => {
    setState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(value), ms);
  };

  return { state, savedAt, schedule, flush };
}
