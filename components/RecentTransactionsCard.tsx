'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Repeat, 
  Plane,
  Trash2,
  Edit3
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  onViewAll: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  baseCurrency?: string;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  onViewAll,
  onEditTransaction,
  onDeleteTransaction,
  baseCurrency = 'IDR',
}) => {
  const [filter, setFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const filtered = safeTransactions.filter((t) => {
    if (!t) return false;
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const recentList = filtered.slice(0, 6);

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header & Quick Filter */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Transaksi Terakhir
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Aktivitas arus kas terkini
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter('inflow')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'inflow'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setFilter('outflow')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'outflow'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {recentList.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
            Belum ada transaksi pada kategori ini
          </div>
        ) : (
          recentList.map((tx, idx) => {
            if (!tx) return null;
            const isInflow = tx.type === 'inflow';
            const isForeign = tx.currency && tx.currency !== baseCurrency;
            const foreignCurrInfo = isForeign && tx.currency ? SUPPORTED_CURRENCIES[tx.currency] : null;
            const txDate = tx.date ? new Date(tx.date) : null;
            const formattedDate = txDate && !isNaN(txDate.getTime())
              ? txDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
              : '-';

            return (
              <div
                key={tx.id || `recent-tx-${idx}`}
                className="group flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isInflow
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {isInflow ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                        {tx.description || 'Tanpa keterangan'}
                      </p>
                      {tx.isRecurring && (
                        <span title="Transaksi Rutin">
                          <Repeat className="w-3 h-3 text-zinc-400 shrink-0" />
                        </span>
                      )}
                      {isForeign && foreignCurrInfo && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 font-medium shrink-0"
                          title={`Valas: ${foreignCurrInfo.code}`}
                        >
                          <Plane className="w-2.5 h-2.5" />
                          <span>{foreignCurrInfo.code}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <span>{tx.category || 'Umum'}</span>
                      <span>•</span>
                      <span>{tx.account || '-'}</span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold block ${
                        isInflow ? 'text-zinc-950 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {isInflow ? '+' : '-'}{formatCurrency(tx.amount ?? 0, baseCurrency)}
                    </span>
                    {isForeign && tx.originalAmount && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
                        {formatCurrency(tx.originalAmount, tx.currency || 'USD')}
                      </span>
                    )}
                  </div>

                  {/* Optional Actions on Desktop Hover */}
                  {(onEditTransaction || onDeleteTransaction) && (
                    <div className="hidden group-hover:flex items-center gap-1 pl-1">
                      {onEditTransaction && (
                        <button
                          type="button"
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteTransaction && (
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer View All Link */}
      <button
        type="button"
        onClick={onViewAll}
        className="w-full py-2.5 px-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5 transition"
      >
        <span>Lihat Semua Riwayat ({transactions.length} Transaksi)</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
