'use client';

import { useEffect, useState } from 'react';
import { useGetMeQuery } from '@/api/auth.api';
import { AccountLinkView, type AccountLinkProps } from './account-link-view';

/**
 * الجزء اللي بيسأل الـAPI "داخل ولا لأ؟" (ومعاه zod) — بيتحمّل متأخر من account-link.tsx.
 * السؤال نفسه بيستنى لما المتصفح يفضى (requestIdleCallback)، عشان ميزاحمش أول رسم للصفحة (L-62).
 */
export default function AccountLinkLive(props: AccountLinkProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Safari لسه مفيهوش requestIdleCallback
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);
  const signedIn = useGetMeQuery(undefined, { skip: !ready }).isSuccess;
  return <AccountLinkView signedIn={signedIn} {...props} />;
}
