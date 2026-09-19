'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export function AppSkeletonLoader() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased">
      {/* Skeleton Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3 w-14 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Skeleton Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Loading status message */}
        <div className="flex items-center justify-center gap-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900 dark:text-zinc-100" />
          <span>Memuat data Paralar...</span>
        </div>

        {/* Hero Card Deck Skeleton */}
        <div className="rounded-[28px] bg-zinc-900 text-white p-6 border border-zinc-800 shadow-xl space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-zinc-800 rounded-full" />
            <div className="h-6 w-16 bg-zinc-800 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-9 w-52 bg-zinc-800 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
            <div className="h-10 bg-zinc-800 rounded-xl" />
            <div className="h-10 bg-zinc-800 rounded-xl" />
          </div>
        </div>

        {/* 4 Quick Actions Skeleton */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 animate-pulse space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-2.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>

        {/* Recent Transactions List Skeleton */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
