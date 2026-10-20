import type { HTMLAttributes, KeyboardEvent } from 'react';

/**
 * خصائص صف جدول بيتفتح بالضغط (10.2): الضغط بالماوس + Tab للصف + Enter أو Space من الكيبورد.
 * الـKeyDown بيشتغل لما الصف نفسه هو اللي عليه الفوكس (مش زرار أو Switch جواه). `canOpen = false` بيرجّع صف عادي.
 */
export function clickableRow(onOpen: () => void, canOpen = true): HTMLAttributes<HTMLElement> {
  if (!canOpen) return {};
  return {
    onClick: onOpen,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onOpen();
      }
    },
    tabIndex: 0,
    style: { cursor: 'pointer' },
  };
}
