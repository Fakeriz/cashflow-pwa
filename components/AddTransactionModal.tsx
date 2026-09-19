'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat,
  Plane,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Transaction, TransactionType, Category, Account } from '@/lib/types';
import { 
  SUPPORTED_CURRENCIES, 
  getStoredBaseCurrency, 
  getExchangeRate, 
  formatCurrency, 
  refreshLiveExchangeRates 
} from '@/lib/currency';
import { getStoredWallets } from '@/lib/wallets';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  editingTransaction?: Transaction | null;
  currentBaseCurrency?: string;
  userId?: string;
}

const CATEGORIES: { label: Category; type: 'both' | 'inflow' | 'outflow'; iconText: string }[] = [
  // Primary Indonesian Categories
  { label: 'Makanan', type: 'outflow', iconText: '🍽️' },
  { label: 'Transportasi', type: 'outflow', iconText: '🚗' },
  { label: 'Tagihan', type: 'outflow', iconText: '💡' },
  { label: 'Belanja', type: 'outflow', iconText: '🛍️' },
  { label: 'Tempat Tinggal', type: 'outflow', iconText: '🏠' },
  { label: 'Software & SaaS', type: 'outflow', iconText: '💻' },
  { label: 'Kesehatan', type: 'outflow', iconText: '💊' },
  { label: 'Hiburan', type: 'outflow', iconText: '🎬' },
  { label: 'Pendidikan', type: 'outflow', iconText: '📚' },
  { label: 'Pajak & Biaya', type: 'outflow', iconText: '🧾' },
  { label: 'Gaji', type: 'inflow', iconText: '💼' },
  { label: 'Bisnis & Klien', type: 'inflow', iconText: '🤝' },
  { label: 'Penjualan', type: 'inflow', iconText: '📦' },
  { label: 'Investasi', type: 'both', iconText: '📈' },
  { label: 'Lainnya', type: 'both', iconText: '✨' },
  // Backward compatibility fallback
  { label: 'Food & Dining', type: 'outflow', iconText: '🍽️' },
  { label: 'Utilities', type: 'outflow', iconText: '⚡' },
  { label: 'Housing & Rent', type: 'outflow', iconText: '🏢' },
  { label: 'Client Work', type: 'inflow', iconText: '💻' },
];

const ACCOUNTS: Account[] = [
  'Checking Account',
  'Operating Account',
  'Savings / Reserve',
  'Credit Card',
  'Cash / Petty',
];

interface FormContentProps {
  editingTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  baseCurrency: string;
  userId?: string;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const TransactionFormContent: React.FC<FormContentProps> = ({
  editingTransaction,
  onClose,
  onSave,
  baseCurrency,
  userId,
}) => {
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? 'outflow');
  
  // Transaction currency (defaults to transaction's currency or active base currency)
  const [txCurrency, setTxCurrency] = useState<string>(
    editingTransaction?.currency ?? baseCurrency
  );
  
  // Amount in transaction currency
  const [inputAmount, setInputAmount] = useState<string>(
    editingTransaction 
      ? (editingTransaction.originalAmount !== undefined 
          ? editingTransaction.originalAmount.toString() 
          : editingTransaction.amount.toString())
      : ''
  );

  // Custom exchange rate adjustment
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<string>('');
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);

  const dynamicWallets = getStoredWallets();
  const dynamicAccountNames = Array.from(
    new Set([...dynamicWallets.map((w) => w.name), ...ACCOUNTS])
  );

  const [description, setDescription] = useState<string>(editingTransaction?.description ?? '');
  const [category, setCategory] = useState<Category>(
    editingTransaction?.category ?? (editingTransaction?.type === 'inflow' ? 'Bisnis & Klien' : 'Makanan')
  );
  const [account, setAccount] = useState<Account>(
    editingTransaction?.account ?? dynamicAccountNames[0] ?? 'TnG'
  );
  const [date, setDate] = useState<string>(editingTransaction?.date ?? getTodayDateString);
  const [isRecurring, setIsRecurring] = useState<boolean>(!!editingTransaction?.isRecurring);

  const isForeign = txCurrency !== baseCurrency;

  // Compute effective exchange rate
  const marketRate = getExchangeRate(txCurrency, baseCurrency);
  const effectiveRate = isCustomRate && parseFloat(customRate) > 0 
    ? parseFloat(customRate) 
    : marketRate;

  // Converted amount in base currency
  const rawNumAmount = parseFloat(inputAmount) || 0;
  const convertedBaseAmount = isForeign 
    ? Math.round(rawNumAmount * effectiveRate) 
    : rawNumAmount;

  // Preset addition
  const handleAddAmount = (addVal: number) => {
    const curr = parseFloat(inputAmount) || 0;
    setInputAmount((curr + addVal).toString());
  };

  const handleRefreshRate = async () => {
    setIsRefreshingRate(true);
    await refreshLiveExchangeRates();
    setIsRefreshingRate(false);
    if (!isCustomRate) {
      setCustomRate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAmount || rawNumAmount <= 0) return;
    if (!description.trim()) return;

    onSave(
      {
        description: description.trim(),
        amount: convertedBaseAmount,
        type,
        category,
        account,
        date,
        currency: txCurrency,
        originalAmount: isForeign ? rawNumAmount : undefined,
        exchangeRate: isForeign ? effectiveRate : undefined,
        isRecurring,
        userId: userId || editingTransaction?.userId,
      },
      editingTransaction?.id
    );

    onClose();
  };

  // Filter categories by type
  const filteredCategories = CATEGORIES.filter(
    (c) => c.type === 'both' || c.type === type
  );

  const currentCurrencyInfo = SUPPORTED_CURRENCIES[txCurrency] || SUPPORTED_CURRENCIES.IDR;
  const baseCurrencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.IDR;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-zinc-900 dark:text-zinc-100">
      {/* Type Toggle (Monochrome) */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setType('outflow');
            if (category === 'Gaji' || category === 'Bisnis & Klien' || category === 'Penjualan') {
              setCategory('Makanan');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
            type === 'outflow'
              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          <span>Pengeluaran (-)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('inflow');
            if (category === 'Makanan' || category === 'Transportasi' || category === 'Tagihan') {
              setCategory('Bisnis & Klien');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
            type === 'inflow'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>Pemasukan (+)</span>
        </button>
      </div>

      {/* Currency Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Mata Uang Transaksi:</span>
          </label>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Mata Uang Dasar: <strong className="text-zinc-900 dark:text-white font-bold">{baseCurrency}</strong>
          </span>
        </div>

        {/* Currency Pill Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
          {Object.values(SUPPORTED_CURRENCIES).map((c) => {
            const isSelected = txCurrency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setTxCurrency(c.code)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <span>{c.flag}</span>
                <span className="text-[10px]">{c.code}</span>
              </button>
            );
          })}
        </div>

        {/* Live Exchange Rate & Auto-Convert Banner */}
        {isForeign && (
          <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-semibold">
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRate ? 'animate-spin' : ''}`} />
                <span>Auto-Convert ke {baseCurrencyInfo.symbol} ({baseCurrency})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshRate}
                  disabled={isRefreshingRate}
                  className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:underline"
                >
                  Kurs Terkini
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomRate(!isCustomRate)}
                  className="text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700"
                >
                  <SlidersHorizontal className="w-2.5 h-2.5" />
                  <span>{isCustomRate ? 'Pakai Kurs Pasar' : 'Ubah Kurs'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between text-zinc-700 dark:text-zinc-300">
              <span className="text-[11px]">
                1 {txCurrency} = {formatCurrency(effectiveRate, baseCurrency)}
              </span>
              {rawNumAmount > 0 && (
                <span className="text-sm font-extrabold text-zinc-950 dark:text-white">
                  ≈ {formatCurrency(convertedBaseAmount, baseCurrency)}
                </span>
              )}
            </div>

            {isCustomRate && (
              <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 shrink-0">Kurs Custom:</span>
                <Input
                  type="number"
                  step="any"
                  placeholder={marketRate.toString()}
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="h-7 text-xs bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amount Input with presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Nominal Transaksi ({currentCurrencyInfo.code})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-900 dark:text-zinc-100">
            {currentCurrencyInfo.symbol}
          </span>
          <Input
            id="modal-tx-amount-input"
            type="number"
            step="any"
            required
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder={txCurrency === 'IDR' ? 'Contoh: 50000' : '0.00'}
            className="pl-14 text-2xl font-black h-14 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white border-zinc-300 dark:border-zinc-800"
            autoFocus={!editingTransaction}
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] uppercase text-zinc-400 font-bold mr-1">Cepat:</span>
          {(txCurrency === 'IDR'
            ? [10000, 25000, 50000, 100000, 250000, 500000, 1000000]
            : [5, 10, 20, 50, 100, 250]
          ).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAddAmount(val)}
              className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium transition shrink-0 border border-zinc-200 dark:border-zinc-700"
            >
              +{txCurrency === 'IDR' ? `${val >= 1000000 ? `${val/1000000}jt` : `${val/1000}rb`}` : `${currentCurrencyInfo.symbol}${val}`}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deskripsi Transaksi</label>
        <Input
          id="modal-tx-desc-input"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'inflow' 
              ? 'Contoh: Gaji Bulanan, Pembayaran Proyek Klien' 
              : 'Contoh: Makan Siang Nasi Padang, Bensin Pertamax, Tagihan Listrik'
          }
          className="h-11 text-sm"
        />
      </div>

      {/* Category Selector with Indonesian Categories */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Kategori Pengeluaran / Pemasukan</span>
          <span className="text-xs text-zinc-900 dark:text-zinc-100 font-bold">{category}</span>
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          {filteredCategories.map((c) => {
            const isSelected = category === c.label;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => setCategory(c.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span>{c.iconText}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Akun / Rekening</label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value as Account)}
            className="flex h-11 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
          >
            {dynamicAccountNames.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tanggal</label>
          <Input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 text-sm"
          />
        </div>
      </div>

      {/* Recurring Option */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <Repeat className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-white block">Cashflow Berulang (Rutin)</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Tercatat berkala otomatis</span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-11 text-sm font-medium"
        >
          Batal
        </Button>
        <Button
          id="save-tx-btn"
          type="submit"
          className="flex-1 h-11 text-sm font-medium"
        >
          {editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
        </Button>
      </div>
    </form>
  );
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currentBaseCurrency,
  userId,
}) => {
  const baseCurrency = currentBaseCurrency || getStoredBaseCurrency();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              {editingTransaction ? 'Edit Transaksi Cashflow' : 'Catat Transaksi Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <TransactionFormContent
          key={editingTransaction ? editingTransaction.id : 'new'}
          editingTransaction={editingTransaction}
          onClose={onClose}
          onSave={onSave}
          baseCurrency={baseCurrency}
          userId={userId}
        />
      </div>
    </div>
  );
};
