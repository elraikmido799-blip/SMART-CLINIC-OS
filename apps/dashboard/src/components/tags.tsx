import type { ReactNode } from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Specialty } from '@oxygen/config';
import { SPECIALTY_TONES, TONES, type Tone, type ToneColors } from '@/app/tones';

function SoftTag({
  colors,
  icon,
  children,
}: {
  colors: ToneColors;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Tag
      icon={icon}
      style={{
        marginInlineEnd: 0,
        borderRadius: 999,
        paddingInline: 10,
        fontWeight: 500,
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Tag الحالة (مؤكد، وصل، مجاش…): خلفية فاتحة وكلام غامق (DEC-41).
 * `neutral` للحاجات اللي مش حالة (البرنامج، نوع الزيارة، الحملة). الكلام لازم يقول الحالة، مش اللون بس.
 */
export function StatusTag({
  tone,
  icon,
  children,
}: {
  tone: Tone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SoftTag colors={TONES[tone]} icon={icon}>
      {children}
    </SoftTag>
  );
}

/** Tag التخصص بلونه (للتخصص بس — DEC-41) */
export function SpecialtyTag({ specialty }: { specialty: Specialty }) {
  const { t } = useTranslation();
  return <SoftTag colors={SPECIALTY_TONES[specialty]}>{t(`specialties.${specialty}`)}</SoftTag>;
}
