'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { WifiOff } from 'lucide-react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

/** شريط بيظهر لما النت يقطع وبيختفي لما يرجع. على السيرفر بنعتبر النت شغال */
export function OfflineNotice() {
  const t = useTranslations('states.offline');
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-ink px-4 py-3 text-sm text-white"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      {t('message')}
    </div>
  );
}
