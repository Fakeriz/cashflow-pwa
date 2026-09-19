'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-tight text-zinc-950 dark:text-white">404</h1>
        <h2 className="text-xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
