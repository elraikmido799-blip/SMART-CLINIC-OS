'use client';

import { MotionConfig } from 'motion/react';
import { DirectionProvider } from '@/components/ui/direction';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StoreProvider } from '@/store/store-provider';

type ProvidersProps = {
  dir: 'rtl' | 'ltr';
  children: React.ReactNode;
};

export function Providers({ dir, children }: ProvidersProps) {
  return (
    <DirectionProvider dir={dir}>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" dir={dir} theme="light" />
          </TooltipProvider>
        </StoreProvider>
      </MotionConfig>
    </DirectionProvider>
  );
}
