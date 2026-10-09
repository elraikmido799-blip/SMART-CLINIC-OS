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
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// dotClassName: نقطة بلون التخصص جنب اسمه في القايمة
export type BookingOption = { value: string; label: string; dotClassName?: string };

type BookingBarProps = {
  specialties: BookingOption[];
  branches: BookingOption[];
};

// shadcn بيحط data-[size=default]:h-8، فلازم نكتب الارتفاع بنفس الشكل (P-14)
const FIELD_TRIGGER =
  'h-11 w-full justify-start gap-2 rounded-md border-field-border bg-card px-3 text-sm text-ink transition-colors hover:border-primary data-[size=default]:h-11 data-placeholder:text-muted-foreground data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-ring/30 *:data-[slot=select-value]:flex-1 [&>svg:first-child]:text-primary [&>svg:last-child]:ms-auto [&>svg:last-child]:transition-transform data-[state=open]:[&>svg:last-child]:rotate-180';

// القايمة بتفتح تحت الخانة على طول وبنفس عرضها (L-35)
const FIELD_CONTENT =
  'w-(--radix-select-trigger-width) rounded-md border border-border p-1.5 shadow-lg ring-0';

const FIELD_ITEM =
  'min-h-11 cursor-pointer rounded-md ps-3 pe-9 text-sm text-ink focus:bg-mist focus:text-ink data-[state=checked]:font-semibold data-[state=checked]:text-primary [&_svg]:text-primary';

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
