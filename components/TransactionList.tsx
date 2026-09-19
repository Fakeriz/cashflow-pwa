'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar, 
  FileText,
  Repeat,
  Plane
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  baseCurrency?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddModal,
  baseCurrency = 'IDR',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const safeTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions]
  );

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeTransactions.forEach((t) => {
      if (t?.category) set.add(t.category);
    });
    return Array.from(set);
  }, [safeTransactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return safeTransactions.filter((t) => {
      if (!t) return false;
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const catMatch = (t.category || '').toLowerCase().includes(query);
        const accMatch = (t.account || '').toLowerCase().includes(query);
        const amtMatch = t.amount != null ? t.amount.toString().includes(query) : false;
        const currMatch = (t.currency || '').toLowerCase().includes(query);
        if (!descMatch && !catMatch && !accMatch && !amtMatch && !currMatch) return false;
      }
      return true;
    });
  }, [safeTransactions, typeFilter, categoryFilter, searchQuery]);

  // Group transactions by date
  const grouped = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    const sorted = [...filtered].sort((a, b) => {
      const timeA = a?.date ? new Date(a.date).getTime() : 0;
      const timeB = b?.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

    sorted.forEach((tx) => {
      if (!tx) return;
      const dateKey = tx.date || 'Lainnya';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  }, [filtered]);

  // CSV Export
  const exportCSV = () => {
    const headers = [
      'ID', 
      'Date', 
      'Type', 
      `Amount (${baseCurrency})`, 
      'Description', 
      'Category', 
      'Account', 
      'Tx Currency',
      'Original Amount',
      'Exchange Rate',
      'IsRecurring'
    ];
    const rows = filtered.map((t) => [
      t?.id || '',
      t?.date || '',
      t?.type || '',
      t?.amount != null ? t.amount : 0,
      `"${(t?.description || '').replace(/"/g, '""')}"`,
      t?.category || '',
      t?.account || '',
      t?.currency || baseCurrency,
      t?.originalAmount || t?.amount || 0,
      t?.exchangeRate || 1,
      t?.isRecurring ? 'Ya' : 'Tidak',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-transaksi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.getTime() === today.getTime()) return 'Hari Ini';
      if (date.getTime() === yesterday.getTime()) return 'Kemarin';

      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search & Header Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              id="transaction-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, Makanan, Transportasi, Tagihan..."
              className="pl-10 h-10 text-xs"
            />
          </div>
          <Button
            id="export-csv-btn"
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="h-10 px-3 text-xs shrink-0 flex items-center gap-1.5"
            title="Ekspor transaksi ke CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </Button>
        </div>

        {/* Filter Pills (Monochrome) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              typeFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('inflow')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              typeFilter === 'inflow'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Pemasukan (+)
          </button>
          <button
            onClick={() => setTypeFilter('outflow')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
              typeFilter === 'outflow'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-sm font-bold'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Pengeluaran (-)
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />

          {/* Categories */}
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 font-semibold'
                : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1.5 rounded-xl text-xs transition shrink-0 ${
                categoryFilter === cat
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Feed */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">Tidak ada transaksi</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau filter kategori.'
              : 'Mulai catat pemasukan atau pengeluaran harian Anda.'}
          </p>
          <Button onClick={onOpenAddModal} size="sm" className="mt-2 font-bold">
            Catat Transaksi
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateStr, items]) => {
            const dateTotal = items.reduce(
              (acc, item) => (item.type === 'inflow' ? acc + item.amount : acc - item.amount),
              0
            );

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formatDateLabel(dateStr)}</span>
                    <span className="text-zinc-400 font-normal">({items.length})</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      dateTotal >= 0
                        ? 'text-zinc-950 dark:text-white font-bold'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {formatCurrency(dateTotal, baseCurrency, { includeSign: true })}
                  </span>
                </div>

                {/* Items in this date group */}
                <div className="space-y-2">
                  {items.map((tx, idx) => {
                    const isInflow = tx?.type === 'inflow';
                    const isForeign = tx?.currency && tx.currency !== baseCurrency;
                    const txId = tx?.id || `tx-item-${idx}`;

                    return (
                      <div
                        key={txId}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Type icon indicator (Monochrome) */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isInflow
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {isInflow ? (
                              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                                {tx?.description || 'Tanpa keterangan'}
                              </span>
                              {tx?.isRecurring && (
                                <span title="Cashflow berulang rutin" className="text-zinc-400">
                                  <Repeat className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
                                </span>
                              )}
                            </div>

                            {/* Category & Overseas Multi-Currency Badge */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{tx?.category || 'Umum'}</span>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{tx?.account || '-'}</span>

                              {/* Overseas Currency Badge (Monochrome) */}
                              {isForeign && tx?.originalAmount && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-medium text-[10px]">
                                    <Plane className="w-2.5 h-2.5" />
                                    <span>
                                      {formatCurrency(tx.originalAmount, tx.currency || 'USD')}
                                    </span>
                                    {tx.exchangeRate && (
                                      <span className="text-zinc-500 dark:text-zinc-400">
                                        (@ {formatCurrency(tx.exchangeRate, baseCurrency)})
                                      </span>
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span
                            className={`text-sm font-bold tracking-tight ${
                              isInflow
                                ? 'text-zinc-950 dark:text-white font-extrabold'
                                : 'text-zinc-600 dark:text-zinc-300 font-semibold'
                            }`}
                          >
                            {formatCurrency(tx?.amount ?? 0, baseCurrency, { includeSign: true })}
                          </span>

                          <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => tx && onEditTransaction(tx)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => tx?.id && onDeleteTransaction(tx.id)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
