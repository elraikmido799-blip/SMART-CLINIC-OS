'use client';

import { lazy, Suspense } from 'react';
import { AccountLinkView, type AccountLinkProps } from './account-link-view';

const AccountLinkLive = lazy(() => import('./account-link-live'));

/**
 * "دخول المريض" ← /login، ولو داخل "بوابتي" ← /portal (16 · 5.3).
 * سؤال الـAPI (وzod معاه) بيتحمّل متأخر عشان ميتقّلش أول تحميل لكل صفحة (L-62).
 * لحد ما يحمّل بيبان "دخول المريض" (الأغلب) بنفس المقاس، فمفيش قفزة في الـNavbar.
 */
export function AccountLink(props: AccountLinkProps) {
  return (
    <Suspense fallback={<AccountLinkView signedIn={false} {...props} />}>
      <AccountLinkLive {...props} />
    </Suspense>
  );
}
