'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { FIELD_CONTENT, FIELD_ITEM, FIELD_TRIGGER } from '@/components/shared/select-styles';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';

const ALL = 'all';

type BranchFilterProps = {
  branches: { value: string; label: string }[];
  // الفلتر الحالي من الـURL، عشان التخصص ميضيعش لما الفرع يتغير
  specialty?: string;
  branch?: string;
};

// فلتر الفرع (A5). القيمة في الـURL (?branch=)، فاللينك بيتبعت والـBack بيرجّع الفلتر
export function BranchFilter({ branches, specialty, branch }: BranchFilterProps) {
  const t = useTranslations('doctorsPage');
  const router = useRouter();

  const onChange = (value: string) => {
    const query: Record<string, string> = {};
    if (specialty) query.specialty = specialty;
    if (value !== ALL) query.branch = value;
    router.push({ pathname: '/doctors', query }, { scroll: false });
  };

  return (
    <div className="grid w-full gap-2 sm:w-60">
      <Label htmlFor="doctors-branch" className="text-ink">
        {t('branchLabel')}
      </Label>
      {/* "كل الفروع" placeholder، عشان النص يبان من السيرفر قبل ما الـJS يحمّل */}
      <Select value={branch ?? ''} onValueChange={onChange} disabled={branches.length === 0}>
        <SelectTrigger id="doctors-branch" className={FIELD_TRIGGER}>
          <MapPin aria-hidden />
          <SelectValue placeholder={t('allBranches')} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={6} className={FIELD_CONTENT}>
          <SelectItem value={ALL} className={FIELD_ITEM}>
            {t('allBranches')}
          </SelectItem>
          {branches.map((option) => (
            <SelectItem key={option.value} value={option.value} className={FIELD_ITEM}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
