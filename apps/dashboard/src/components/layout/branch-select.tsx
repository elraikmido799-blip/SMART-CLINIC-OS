import { Flex, Select, Typography } from 'antd';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { localized } from '@oxygen/shared';
import { useLocale } from '@/app/use-locale';
import { useBranchScope } from '@/features/branches/use-branch-scope';
import { ALL_BRANCHES } from '@/store/ui-slice';
import { tokens } from '@oxygen/config';

/** اختيار الفرع في الـTop bar (الفرع بيتغير من هنا بس — DEC-41) */
export function BranchSelect({ width }: { width: number }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { branchId, branches, canSeeAll, setBranchId } = useBranchScope();

  const options = [
    ...(canSeeAll ? [{ value: ALL_BRANCHES, label: t('branches.all') }] : []),
    ...branches.map((branch) => ({ value: branch.id, label: localized(branch, 'name', locale) })),
  ];

  // فرع واحد بس = اسمه ثابت (مش Select مقفول شكله باهت)
  if (options.length < 2) {
    return (
      <Flex
        align="center"
        gap={8}
        aria-label={t('branches.label')}
        style={{
          height: 40,
          paddingInline: 12,
          borderRadius: 12,
          border: `1px solid ${tokens.color.border}`,
          maxWidth: width,
        }}
      >
        <MapPin size={16} color={tokens.color.primary} aria-hidden />
        <Typography.Text ellipsis>{options[0]?.label}</Typography.Text>
      </Flex>
    );
  }

  return (
    <Select
      aria-label={t('branches.label')}
      value={branchId}
      onChange={setBranchId}
      options={options}
      prefix={<MapPin size={16} color={tokens.color.primary} aria-hidden />}
      style={{ width }}
      popupMatchSelectWidth={false}
    />
  );
}
