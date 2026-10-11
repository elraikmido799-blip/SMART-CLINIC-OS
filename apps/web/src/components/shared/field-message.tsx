import { CircleAlert } from 'lucide-react';

/**
 * رسالة الخطأ تحت الخانة: الكلام بالكحلي وجنبه أيقونة حمرا، لأن الأحمر (#E5484D) على الأبيض
 * contrast بتاعه 3.9 بس، وده أقل من AA للكلام الصغير (4.5) — DEC-36.
 */
export function FieldMessage({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-ink">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      {error}
    </p>
  );
}

/** الرسالة فوق زرار الإرسال لما الطلب كله يفشل (نت · كتير · بيانات غلط · سيرفر). */
export function SubmitErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-5 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-ink"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      {children}
    </p>
  );
}
