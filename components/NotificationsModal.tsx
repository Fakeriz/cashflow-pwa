'use client';

import React from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeftRight, 
  CreditCard,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Transfer Berhasil',
      desc: 'Pemindahan dana RM 275.00 dari TnG ke Bank Jago telah tercatat.',
      time: '19 Sep 2026 · 12:09 PM',
      icon: ArrowLeftRight,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40',
    },
    {
      id: 'notif-2',
      title: 'Pengeluaran Makanan',
      desc: 'Transaksi Food & Dining RM 6.00 berhasil dipotong dari saldo TnG.',
      time: '19 Sep 2026 · 12:10 PM',
      icon: CreditCard,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      id: 'notif-3',
      title: 'Penyimpanan Offline & PWA Aktif',
      desc: 'Aplikasi berjalan dalam mode offline-first yang aman dan cepat.',
      time: 'Hari ini',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Notifikasi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aktivitas & pemberitahuan akun
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 leading-snug">
                    {n.desc}
                  </p>
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    {n.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <Button type="button" onClick={onClose} className="h-9 px-4 text-xs font-bold">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
