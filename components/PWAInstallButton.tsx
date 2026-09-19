'use client';

import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs font-semibold ${
          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        }`}
        title="Pasang aplikasi Cashflow ke Home Screen"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all text-xs font-medium ${
            compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
          }`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4 text-zinc-900 dark:text-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold">Pasang di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                  <Share className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                  <span>1. Tekan tombol <strong>Share / Bagikan</strong> di navigasi bawah Safari</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950">
                  <PlusSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                  <span>2. Gulir ke bawah dan pilih <strong>Add to Home Screen (Tambah ke Layar Utama)</strong></span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
