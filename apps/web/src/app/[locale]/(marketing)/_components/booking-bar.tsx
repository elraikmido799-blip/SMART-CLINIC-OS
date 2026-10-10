'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Stethoscope } from 'lucide-react';
import { brandButton } from '@/components/shared/brand';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FIELD_CONTENT, FIELD_ITEM, FIELD_TRIGGER } from '@/components/shared/select-styles';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// dotClassName: نقطة بلون التخصص جنب اسمه في القايمة
export type BookingOption = { value: string; label: string; dotClassName?: string };

type BookingBarProps = {
  specialties: BookingOption[];
  branches: BookingOption[];
};

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  options: BookingOption[];
  value: string;
  onChange: (value: string) => void;
};

function BookingField({ id, label, placeholder, icon, options, value, onChange }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-ink">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={options.length === 0}>
        <SelectTrigger id={id} className={FIELD_TRIGGER}>
          {icon}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={6} className={FIELD_CONTENT}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className={FIELD_ITEM}>
              {option.dotClassName && (
                <span
                  className={cn('size-2 shrink-0 rounded-full', option.dotClassName)}
                  aria-hidden
                />
              )}
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * شريط الحجز (A0 · A1): التخصص + الفرع ← صفحة الحجز.
 * الاختيارين مش إجباريين: لو الداتا فشلت أو الزائر ماختارش، صفحة الحجز بتسأله.
 */
export function BookingBar({ specialties, branches }: BookingBarProps) {
  const t = useTranslations('bookingBar');
  const router = useRouter();
  const [specialty, setSpecialty] = useState('');
  const [branch, setBranch] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query: Record<string, string> = {};
    if (specialty) query.specialty = specialty;
    if (branch) query.branch = branch;
    router.push({ pathname: '/book', query });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={t('label')}
      className="grid w-full gap-4 rounded-lg border border-border bg-card p-4 text-start shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
    >
      <BookingField
        id="booking-specialty"
        label={t('specialty')}
        placeholder={t('specialtyPlaceholder')}
        icon={<Stethoscope aria-hidden />}
        options={specialties}
        value={specialty}
        onChange={setSpecialty}
      />
      <BookingField
        id="booking-branch"
        label={t('branch')}
        placeholder={t('branchPlaceholder')}
        icon={<MapPin aria-hidden />}
        options={branches}
        value={branch}
        onChange={setBranch}
      />
      <button
        type="submit"
        className={cn(brandButton({ tone: 'gold' }), 'sm:col-span-2 lg:col-span-1')}
      >
        {t('submit')}
      </button>
    </form>
  );
}
