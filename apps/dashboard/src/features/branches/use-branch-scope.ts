import { useMe } from '@/features/auth/use-me';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { ALL_BRANCHES, setBranch } from '@/store/ui-slice';
import { useGetBranchesQuery } from './branches.api';

/**
 * الفرع اللي الشاشات بتعرض داتته (من اختيار الـTop bar).
 * `all` لأي حد شغال على أكتر من فرع. الاختيار المتخزن لو مش من فروعه بيرجع للافتراضي.
 */
export function useBranchScope() {
  const me = useMe();
  const dispatch = useAppDispatch();
  const stored = useAppSelector((state) => state.ui.branchId);
  const { data: branches = [] } = useGetBranchesQuery();

  const canSeeAll = me.all_branches || me.branch_ids.length > 1;
  const isValid =
    (stored === ALL_BRANCHES && canSeeAll) || (stored !== null && me.branch_ids.includes(stored));
  const fallback = me.all_branches ? ALL_BRANCHES : me.branch_ids[0];

  return {
    branchId: isValid ? stored : fallback,
    branches,
    canSeeAll,
    setBranchId: (id: string) => dispatch(setBranch(id)),
  };
}
