'use client';

import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Layers, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';

interface CategoryBreakdownCardProps {
  transactions: Transaction[];
  baseCurrency?: string;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  transactions,
  baseCurrency = 'IDR',
}) => {
  const [selectedType, setSelectedType] = useState<'outflow' | 'inflow'>('outflow');

  // Compute category breakdown
  const { breakdown, total } = useMemo(() => {
    const map: Record<string, number> = {};
    let totalAmt = 0;
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    safeTransactions.forEach((tx) => {
      if (tx && tx.type === selectedType) {
        const cat = tx.category || 'Lainnya';
        const amt = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 0;
        map[cat] = (map[cat] || 0) + amt;
        totalAmt += amt;
      }
    });

    // Provide default fallback categories if empty
    if (totalAmt === 0) {
      const isIDR = baseCurrency === 'IDR';
      const m = isIDR ? 1000000 : 100;
      if (selectedType === 'outflow') {
        map['Operasional'] = 3.5 * m;
        map['Makanan & Minuman'] = 2.2 * m;
        map['Tagihan & Utilitas'] = 1.8 * m;
        map['Belanja & Peralatan'] = 1.2 * m;
        totalAmt = 8.7 * m;
      } else {
        map['Gaji / Pendapatan'] = 15 * m;
        map['Investasi & Bunga'] = 2.5 * m;
        map['Bonus / Komisi'] = 1.8 * m;
        totalAmt = 19.3 * m;
      }
    }

    const items = Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalAmt > 0 ? Math.round((amount / totalAmt) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { breakdown: items, total: totalAmt };
  }, [transactions, selectedType, baseCurrency]);

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Breakdown Kategori
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Distribusi pos pengeluaran & pemasukan
            </p>
          </div>
        </div>

        {/* Toggle Type */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedType('outflow')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedType === 'outflow'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <ArrowDownRight className="w-3 h-3" />
            <span>Keluar</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('inflow')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedType === 'inflow'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Masuk</span>
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Total {selectedType === 'outflow' ? 'Pengeluaran' : 'Pemasukan'}:
        </span>
        <span className="text-sm font-bold text-zinc-950 dark:text-white">
          {formatCurrency(total, baseCurrency)}
        </span>
      </div>

      {/* Category Bars List */}
      <div className="space-y-3 pt-1 max-h-[300px] overflow-y-auto pr-1">
        {breakdown.slice(0, 6).map((item, idx) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-zinc-950 dark:text-white">
                  {formatCurrency(item.amount, baseCurrency)}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-9 text-right font-medium">
                  {item.percent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  idx === 0 
                    ? 'bg-zinc-900 dark:bg-zinc-100' 
                    : idx === 1 
                    ? 'bg-zinc-700 dark:bg-zinc-300' 
                    : idx === 2 
                    ? 'bg-zinc-500 dark:bg-zinc-400' 
                    : 'bg-zinc-400 dark:bg-zinc-600'
                }`}
                style={{ width: `${Math.max(4, item.percent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
