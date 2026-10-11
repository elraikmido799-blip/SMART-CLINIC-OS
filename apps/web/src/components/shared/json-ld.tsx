/**
 * داتا منظمة لجوجل (JSON-LD — 16 · 7.1): MedicalClinic في الرئيسية والفروع، وPhysician في صفحة الدكتور.
 * "<" بيتحول عشان محدش يقدر يقفل الـscript من جوه الداتا.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}
