import { Activity, Apple, PersonStanding, ScanFace, type LucideProps } from 'lucide-react';
import type { Specialty } from '@oxygen/config';
import { tokens } from '@oxygen/config';

// أيقونة كل تخصص بلونه (هيدر أعمدة الكالندر · الكروت). من غير قلب (DEC-41)
const ICONS = {
  nutrition: Apple,
  physio: PersonStanding,
  derm: ScanFace,
  internal: Activity,
} satisfies Record<Specialty, unknown>;

export function SpecialtyIcon({
  specialty,
  size = 20,
  ...props
}: { specialty: Specialty } & LucideProps) {
  const Icon = ICONS[specialty];
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      color={tokens.specialty[specialty]}
      aria-hidden
      {...props}
    />
  );
}
