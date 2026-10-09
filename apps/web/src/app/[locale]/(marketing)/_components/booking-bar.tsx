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

export type BookingOption = { value: string; label: string };

type BookingBarProps = {
  specialties: BookingOption[];
  branches: BookingOption[];
};

const FIELD_TRIGGER =
  'h-11 w-full gap-2 rounded-md border-field-border data-[size=default]:h-11 justify-start bg-card px-3 *:data-[slot=select-value]:flex-1 [&>svg:last-child]:ms-auto text-sm text-ink data-placeholder:text-muted-foreground [&>svg:first-child]:text-primary';

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
      className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
    >
      <div className="grid gap-2">
        <Label htmlFor="booking-specialty" className="text-ink">
          {t('specialty')}
        </Label>
        <Select value={specialty} onValueChange={setSpecialty} disabled={specialties.length === 0}>
          <SelectTrigger id="booking-specialty" className={FIELD_TRIGGER}>
            <Stethoscope aria-hidden />
            <SelectValue placeholder={t('specialtyPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="booking-branch" className="text-ink">
          {t('branch')}
        </Label>
        <Select value={branch} onValueChange={setBranch} disabled={branches.length === 0}>
          <SelectTrigger id="booking-branch" className={FIELD_TRIGGER}>
            <MapPin aria-hidden />
            <SelectValue placeholder={t('branchPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {branches.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="submit"
        className={cn(brandButton({ tone: 'gold' }), 'sm:col-span-2 lg:col-span-1')}
      >
        {t('submit')}
      </button>
    </form>
  );
}
