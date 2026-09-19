'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Terjadi Kesalahan Sistem
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gagal memuat struktur root layout. Silakan muat ulang halaman.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white transition"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
