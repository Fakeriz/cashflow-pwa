'use client';

import React from 'react';
import { 
  ArrowLeftRight, 
  Utensils, 
  Receipt, 
  ShoppingBag, 
  Car, 
  Home, 
  Laptop, 
  HeartPulse, 
  GraduationCap, 
  Film, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { BankAccount, Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';

interface AccountRecentTransactionsProps {
  activeWallet: BankAccount;
  transactions: Transaction[];
  onOpenMoveModal: () => void;
  onViewAll: () => void;
  onOpenAddModal: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  hideBalance?: boolean;
}

export const AccountRecentTransactions: React.FC<AccountRecentTransactionsProps> = ({
  activeWallet,
  transactions,
  onOpenMoveModal,
  onViewAll,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  hideBalance = false,
}) => {
  // Filter transactions for this specific wallet
  // Either originated from this wallet, or transferred TO this wallet
  const walletTransactions = transactions.filter(
    (tx) => tx.account === activeWallet.name || tx.transferToAccount === activeWallet.name
  );

  // Helper to choose icon
  const getCategoryIcon = (tx: Transaction) => {
    // If it's a transfer
    if (tx.transferToAccount || tx.description.includes('→') || tx.category === 'Lainnya' && tx.description.toLowerCase().includes('transfer')) {
      return <ArrowLeftRight className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }

    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category || '').toLowerCase();

    if (cat.includes('makan') || desc.includes('food') || desc.includes('dining') || desc.includes('kopi') || desc.includes('lunch')) {
      return <Utensils className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }
    if (cat.includes('transport') || desc.includes('grab') || desc.includes('gojek') || desc.includes('bensin')) {
      return <Car className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }
    if (cat.includes('belanja') || desc.includes('shop') || desc.includes('mall')) {
      return <ShoppingBag className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }
    if (cat.includes('tagihan') || cat.includes('utilit') || desc.includes('listrik') || desc.includes('wifi')) {
      return <Receipt className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }
    if (cat.includes('software') || cat.includes('saas') || desc.includes('cloud') || desc.includes('apple')) {
      return <Laptop className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
    }

    if (tx.type === 'inflow') {
      return <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Receipt className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  };

  const curr = activeWallet.currency || 'MYR';
  const currencySymbol = curr === 'MYR' ? 'RM' : curr === 'IDR' ? 'Rp' : curr === 'USD' ? '$' : curr;

  return (
    <div className="w-full rounded-[26px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 p-5 sm:p-6 shadow-sm">
      {/* Header matching screenshot: "Recent · TnG" [⇄ Move] [See all] */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
            Recent · {activeWallet.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Move Button */}
          <button
            id="recent-move-funds-btn"
            type="button"
            onClick={onOpenMoveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition active:scale-95"
            title={`Pindahkan dana dari/ke ${activeWallet.name}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Move</span>
          </button>

          {/* See all Link */}
          <button
            id="recent-see-all-btn"
            type="button"
            onClick={onViewAll}
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition px-1.5 py-1"
          >
            See all
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
        {walletTransactions.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi di akun <strong>{activeWallet.name}</strong>.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-white hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah transaksi pertama</span>
            </button>
          </div>
        ) : (
          walletTransactions.slice(0, 6).map((tx) => {
            const isTransfer = !!tx.transferToAccount || tx.description.includes('→');
            const isIncomingTransfer = tx.transferToAccount === activeWallet.name && tx.account !== activeWallet.name;
            const isOutgoing = tx.type === 'outflow' && !isIncomingTransfer;
            
            // Format subtitle line: e.g. "Food & Dining · 19 Sep 2026 · 12:10 PM" or "New Transfer · 19 Sep 2026 · 12:09 PM"
            let categoryOrNote = tx.notes || tx.category;
            if (isTransfer && !tx.notes) {
              categoryOrNote = 'New Transfer';
            }
            const dateStr = tx.date;
            const timeStr = tx.time || '12:00 PM';
            const subtitle = `${categoryOrNote} · ${dateStr} · ${timeStr}`;

            return (
              <div
                key={tx.id}
                onClick={() => onEditTransaction && onEditTransaction(tx)}
                className="group flex items-center justify-between py-3.5 px-1 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 rounded-xl transition cursor-pointer"
              >
                {/* Left: Icon in square rounded box + Title & Subtitle */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(tx)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {tx.description}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isOutgoing && !isTransfer
                        ? 'text-rose-500 dark:text-rose-400'
                        : isIncomingTransfer
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {hideBalance ? (
                      '••••'
                    ) : (
                      <>
                        {currencySymbol} {tx.amount.toFixed(2)}
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
