'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Wallet, 
  Building2, 
  Coins, 
  Check, 
  Trash2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { BankAccount } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: BankAccount) => void;
  onDelete?: (walletId: string) => void;
  editingWallet?: BankAccount | null;
  baseCurrency?: string;
}

const PRESET_NAMES = [
  { name: 'TnG', type: 'ewallet', tag: 'BELANJE', currency: 'MYR' },
  { name: 'Bank Jago', type: 'bank', tag: 'BELANJE', currency: 'MYR' },
  { name: 'BCA', type: 'bank', tag: 'UTAMA', currency: 'IDR' },
  { name: 'Mandiri', type: 'bank', tag: 'GAJI', currency: 'IDR' },
  { name: 'GoPay', type: 'ewallet', tag: 'BELANJE', currency: 'IDR' },
  { name: 'ShopeePay', type: 'ewallet', tag: 'BELANJE', currency: 'IDR' },
  { name: 'Maybank', type: 'bank', tag: 'UTAMA', currency: 'MYR' },
  { name: 'Wise', type: 'bank', tag: 'TABUNGAN', currency: 'USD' },
  { name: 'Cash / Dompet', type: 'cash', tag: 'HARIAN', currency: 'MYR' },
];

const THEME_OPTIONS: { id: BankAccount['colorTheme']; label: string; bgClass: string; accent: string }[] = [
  { id: 'dark', label: 'Onyx Dark Gold', bgClass: 'from-zinc-950 via-zinc-900 to-black', accent: 'text-amber-400' },
  { id: 'navy', label: 'Midnight Navy', bgClass: 'from-slate-950 via-blue-950 to-zinc-950', accent: 'text-sky-400' },
  { id: 'emerald', label: 'Deep Emerald', bgClass: 'from-zinc-950 via-emerald-950 to-zinc-950', accent: 'text-emerald-400' },
  { id: 'purple', label: 'Royal Plum', bgClass: 'from-zinc-950 via-purple-950 to-zinc-950', accent: 'text-purple-400' },
  { id: 'slate', label: 'Titanium Slate', bgClass: 'from-zinc-900 via-neutral-900 to-zinc-950', accent: 'text-zinc-300' },
];

const AddWalletForm: React.FC<AddWalletModalProps> = ({
  onClose,
  onSave,
  onDelete,
  editingWallet,
  baseCurrency = 'MYR',
}) => {
  const [name, setName] = useState(editingWallet?.name || '');
  const [type, setType] = useState<BankAccount['type']>(editingWallet?.type || 'bank');
  const [categoryTag, setCategoryTag] = useState(editingWallet?.categoryTag || 'BELANJE');
  const [currency, setCurrency] = useState(editingWallet?.currency || baseCurrency || 'MYR');
  const [initialBalance, setInitialBalance] = useState<string>(
    editingWallet ? String(editingWallet.initialBalance) : '0'
  );
  const [colorTheme, setColorTheme] = useState<BankAccount['colorTheme']>(
    editingWallet?.colorTheme || 'dark'
  );
  const [accountNumber, setAccountNumber] = useState(editingWallet?.accountNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBalance = parseFloat(initialBalance) || 0;

    const newWallet: BankAccount = {
      id: editingWallet ? editingWallet.id : `wallet-${Date.now()}`,
      name: name.trim(),
      type,
      categoryTag: categoryTag.trim().toUpperCase() || 'BELANJE',
      initialBalance: parsedBalance,
      currency: currency.toUpperCase(),
      colorTheme: colorTheme || 'dark',
      accountNumber: accountNumber.trim() || undefined,
      isDefault: editingWallet?.isDefault ?? false,
    };

    onSave(newWallet);
    onClose();
  };

  const handleSelectPreset = (p: typeof PRESET_NAMES[0]) => {
    setName(p.name);
    setType(p.type as BankAccount['type']);
    setCategoryTag(p.tag);
    setCurrency(p.currency);
  };

  const symbol = currency === 'MYR' ? 'RM' : currency === 'IDR' ? 'Rp' : currency === 'USD' ? '$' : currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              {editingWallet ? 'Ubah Akun / Wallet Card' : 'Tambah Akun / Wallet Card'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Desain kartu akun dompet untuk swipe di halaman utama
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Live Card Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pratinjau Kartu (Live Preview)
            </span>

            <div 
              className="relative w-full h-44 rounded-[24px] overflow-hidden p-5 text-white shadow-xl border border-zinc-800"
              style={{
                background: 'linear-gradient(135deg, #090d16 0%, #0d131f 45%, #0a0e17 100%)',
              }}
            >
              {/* Subtle wave vector */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 240" fill="none">
                <path d="M-50 40 C 100 120, 250 -30, 450 60" stroke="currentColor" strokeWidth="0.8" className="text-amber-500/40" />
                <path d="M-40 80 C 120 160, 270 20, 460 110" stroke="currentColor" strokeWidth="0.8" className="text-amber-500/30" />
              </svg>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      {type === 'bank' && <Building2 className="w-4 h-4 text-amber-400" />}
                      {type === 'ewallet' && <Wallet className="w-4 h-4 text-sky-400" />}
                      {type === 'cash' && <Coins className="w-4 h-4 text-emerald-400" />}
                      {type === 'card' && <CreditCard className="w-4 h-4 text-rose-400" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight leading-tight">
                        {name.trim() || 'Nama Akun'}
                      </h4>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                        {type === 'ewallet' ? 'E-WALLET' : type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400/90 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                    {categoryTag || 'BELANJE'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                    BALANCE
                  </span>
                  <div className="flex items-baseline gap-1 font-bold">
                    <span className="text-base text-zinc-300">{symbol}</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {(parseFloat(initialBalance) || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-400 pt-1 border-t border-white/5">
                  <span>INCOME {symbol} 0.00</span>
                  <span>SPENDING {symbol} 0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Pilihan Cepat (Presets)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_NAMES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form id="add-wallet-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Wallet Name */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Nama Akun / Kartu <span className="text-rose-500">*</span>
              </label>
              <Input
                id="wallet-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: TnG, Bank Jago, BCA, Maybank"
                className="h-11 text-sm font-medium"
              />
            </div>

            {/* Type & Pocket Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tipe Akun
                </label>
                <select
                  id="wallet-type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as BankAccount['type'])}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white"
                >
                  <option value="bank">Bank (Debit / Rekening)</option>
                  <option value="ewallet">E-Wallet (TnG, GoPay, ShopeePay)</option>
                  <option value="cash">Uang Tunai / Cash</option>
                  <option value="card">Kartu Kredit / PayLater</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tag Saku / Pocket
                </label>
                <Input
                  id="wallet-tag-input"
                  type="text"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  placeholder="BELANJE, TABUNGAN, dll."
                  className="h-11 text-sm uppercase font-bold"
                />
              </div>
            </div>

            {/* Initial Balance & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Saldo Awal
                </label>
                <Input
                  id="wallet-initial-balance-input"
                  type="number"
                  step="any"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  className="h-11 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                  Mata Uang
                </label>
                <select
                  id="wallet-currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white"
                >
                  <option value="MYR">MYR (Ringgit Malaysia - RM)</option>
                  <option value="IDR">IDR (Rupiah Indonesia - Rp)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="SGD">SGD (Singapore Dollar - S$)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                  <option value="GBP">GBP (British Pound - £)</option>
                </select>
              </div>
            </div>

            {/* Nomor Akun Opsional */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Nomor Rekening / Kartu (Opsional)
              </label>
              <Input
                id="wallet-number-input"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: •••• 8821 atau 12345678"
                className="h-11 text-sm"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          {editingWallet && onDelete ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (confirm(`Hapus akun ${editingWallet.name}?`)) {
                  onDelete(editingWallet.id);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900 h-11 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Hapus</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-4 text-sm font-medium"
            >
              Batal
            </Button>
            <Button
              form="add-wallet-form"
              type="submit"
              className="h-11 px-5 text-sm font-medium"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>{editingWallet ? 'Simpan Perubahan' : 'Tambah Akun'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddWalletModal: React.FC<AddWalletModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <AddWalletForm key={props.editingWallet?.id || 'new'} {...props} />;
};

