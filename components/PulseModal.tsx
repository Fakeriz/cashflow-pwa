'use client';

import React from 'react';
import { 
  X, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { BankAccount, Transaction } from '@/lib/types';
import { calculateWalletStats } from '@/lib/wallets';
import { Button } from './ui/button';

interface PulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: BankAccount | null;
  transactions: Transaction[];
  onOpenMoveModal: () => void;
  onOpenAddTransaction: () => void;
}

export const PulseModal: React.FC<PulseModalProps> = ({
  isOpen,
  onClose,
  wallet,
  transactions,
  onOpenMoveModal,
  onOpenAddTransaction,
}) => {
  if (!isOpen || !wallet) return null;

  const stats = calculateWalletStats(wallet, transactions);
  const curr = wallet.currency || 'MYR';
  const symbol = curr === 'MYR' ? 'RM' : curr === 'IDR' ? 'Rp' : curr === 'USD' ? '$' : curr;

  // Calculate wallet health score
  const safeBalance = stats.currentBalance > 100;
  const healthScore = stats.currentBalance > 500 ? 94 : stats.currentBalance > 100 ? 82 : 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Wallet Pulse · {wallet.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Analisis kesehatan finansial dompet real-time
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Health Gauge Highlight */}
          <div className="p-5 rounded-2xl bg-zinc-950 text-white relative overflow-hidden border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                STATUS KESEHATAN KARTU
              </span>
              <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                {healthScore > 80 ? 'PRIMA / SEHAT' : 'PERLU PERHATIAN'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black text-white tracking-tight">
                  {healthScore}
                  <span className="text-sm font-semibold text-zinc-400">/100</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Saldo lancar: {symbol} {stats.currentBalance.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                  PENGELUARAN
                </span>
                <span className="text-sm font-bold text-rose-400">
                  {symbol} {stats.totalSpending.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                Kategori Pocket
              </span>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                {wallet.categoryTag || 'BELANJE'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                Tipe Akun
              </span>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase">
                {wallet.type}
              </span>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
              Tindakan Cepat (Quick Actions)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMoveModal();
                }}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Pindah Saldo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddTransaction();
                }}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Catat Belanja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <Button type="button" onClick={onClose} className="h-9 px-4 text-xs font-bold">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
