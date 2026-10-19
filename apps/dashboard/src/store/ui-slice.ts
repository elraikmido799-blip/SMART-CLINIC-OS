import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** الفرع اللي الموظف شغال عليه (من الـTop bar). `all` = كل الفروع، للي عنده الصلاحية. */
export const ALL_BRANCHES = 'all';

const BRANCH_KEY = 'oxygen-staff-branch';

function readStoredBranch(): string | null {
  try {
    return localStorage.getItem(BRANCH_KEY);
  } catch {
    return null;
  }
}

type UiState = { branchId: string | null };

const initialState: UiState = { branchId: readStoredBranch() };

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBranch(state, action: PayloadAction<string>) {
      state.branchId = action.payload;
      try {
        localStorage.setItem(BRANCH_KEY, action.payload);
      } catch {
        // المتصفح مانع التخزين: الاختيار بيفضل لحد الـRefresh بس
      }
    },
  },
});

export const { setBranch } = uiSlice.actions;
