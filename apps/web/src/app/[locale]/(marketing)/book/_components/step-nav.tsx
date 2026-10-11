'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';

type StepNavProps = {
  onBack?: () => void;
  // من غير onNext = الخطوة بتكمل لوحدها لما تختار (الخدمة والفرع)
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  // "التالي" بيبعت فورم بدل onClick
  nextType?: 'button' | 'submit';
};

/** "رجوع" (Outline) + "كمّل" (الدهبي — الزرار الأساسي الوحيد في الخطوة). الأسهم بتتقلب في العربي. */
export function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  loading,
  nextType = 'button',
}: StepNavProps) {
  const t = useTranslations('booking');
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className={brandButton({ tone: 'outline', size: 'lg' })}
        >
          <ArrowLeft className="rtl:rotate-180" aria-hidden />
          {t('back')}
        </button>
      ) : (
        <span />
      )}
      {(onNext || nextType === 'submit') && (
        <button
          type={nextType}
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={brandButton({
            tone: 'gold',
            size: 'lg',
            className: 'disabled:cursor-not-allowed disabled:opacity-60',
          })}
        >
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {nextLabel ?? t('continue')}
          {!loading && <ArrowRight className="rtl:rotate-180" aria-hidden />}
        </button>
      )}
    </div>
  );
}
