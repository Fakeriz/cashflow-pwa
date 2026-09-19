'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3.5 py-1 text-xs font-semibold shadow-lg border border-zinc-700 dark:border-zinc-300 animate-bounce"
    >
      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>Mode Offline — Data tersimpan lokal</span>
    </div>
  );
};
