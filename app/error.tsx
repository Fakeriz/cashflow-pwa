'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-md w-full text-center space-y-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-900 dark:text-white">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Terjadi Kendala Teknis
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Aplikasi mendeteksi kendala sementara saat merender tampilan. Silakan klik tombol di bawah untuk memuat ulang.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full gap-2 font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Tampilan</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
