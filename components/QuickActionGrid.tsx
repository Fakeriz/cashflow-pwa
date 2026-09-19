'use client';

import React from 'react';
import { 
  ReceiptText, 
  Image as ImageIcon, 
  Users, 
  BarChart3 
} from 'lucide-react';

interface QuickActionGridProps {
  onOpenBills: () => void;
  onOpenReceipts: () => void;
  onOpenBillSplit: () => void;
  onOpenAnalytics: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onOpenBills,
  onOpenReceipts,
  onOpenBillSplit,
  onOpenAnalytics,
}) => {
  const actions = [
    {
      id: 'quick-action-bills',
      label: 'Bills',
      icon: ReceiptText,
      onClick: onOpenBills,
      description: 'Tagihan & langganan rutin',
    },
    {
      id: 'quick-action-receipts',
      label: 'Receipts',
      icon: ImageIcon,
      onClick: onOpenReceipts,
      description: 'Struk & bukti transaksi',
    },
    {
      id: 'quick-action-split',
      label: 'Bill Split',
      icon: Users,
      onClick: onOpenBillSplit,
      description: 'Bagi tagihan patungan',
    },
    {
      id: 'quick-action-analytics',
      label: 'Analytics',
      icon: BarChart3,
      onClick: onOpenAnalytics,
      description: 'Statistik & grafik cashflow',
    },
  ];

  return (
    <div className="w-full grid grid-cols-4 gap-2.5 sm:gap-3.5 my-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            id={act.id}
            type="button"
            onClick={act.onClick}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors mb-2">
              <Icon className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
              {act.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
