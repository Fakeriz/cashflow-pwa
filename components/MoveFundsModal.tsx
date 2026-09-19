'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Wallet, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { BankAccount, Transaction } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MoveFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: BankAccount[];
  activeWallet: BankAccount;
  onTransfer: (transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
    notes: string;
    date: string;
    time: string;
    currency: string;
  }) => void;
}

export const MoveFundsModal: React.FC<MoveFundsModalProps> = ({
  isOpen,
  onClose,
  wallets,
  activeWallet,
  onTransfer,
}) => {
  const [fromAccount, setFromAccount] = useState(activeWallet.name);
  // Default to another wallet
  const otherWallets = wallets.filter((w) => w.name !== activeWallet.name);
  const [toAccount, setToAccount] = useState(
    otherWallets.length > 0 ? otherWallets[0].name : ''
  );
  const [amount, setAmount] = useState<string>('275.00');
  const [notes, setNotes] = useState('New Transfer');

  // Format current time e.g. "12:09 PM"
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const [time, setTime] = useState(getFormattedTime());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const sourceWallet = wallets.find((w) => w.name === fromAccount) || activeWallet;
  const curr = sourceWallet.currency || 'MYR';
  const symbol = curr === 'MYR' ? 'RM' : curr === 'IDR' ? 'Rp' : curr === 'USD' ? '$' : curr;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (fromAccount === toAccount) {
      alert('Pilih rekening tujuan yang berbeda dengan rekening asal.');
      return;
    }

    onTransfer({
      fromAccount,
      toAccount,
      amount: parsedAmount,
      description: `${fromAccount} → ${toAccount}`,
      notes: notes.trim() || 'New Transfer',
      date,
      time,
      currency: curr,
    });

    onClose();
  };

  const quickAmounts = [10, 50, 100, 275, 500];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Pindah Dana (Move)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transfer saldo antar dompet / rekening
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transfer Route Visual */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="grid grid-cols-5 items-center gap-2">
              {/* From */}
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  DARI
                </span>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-white truncate focus:outline-none"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex justify-center pt-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* To */}
              <div className="col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  KE TUJUAN
                </span>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-white truncate focus:outline-none"
                >
                  {wallets
                    .filter((w) => w.name !== fromAccount)
                    .map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Nominal Transfer ({symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                {symbol}
              </span>
              <Input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-12 pl-12 text-lg font-bold"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toFixed(2))}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan & Waktu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Keterangan
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="New Transfer"
                className="h-11 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Waktu
              </label>
              <Input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="12:09 PM"
                className="h-11 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-4 text-sm font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 text-sm font-medium shadow-xs"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Konfirmasi Pindah Dana</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
