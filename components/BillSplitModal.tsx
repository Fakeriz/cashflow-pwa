'use client';

import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Copy, 
  Check, 
  Calculator, 
  DollarSign, 
  Percent,
  Share2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface BillSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const BillSplitModal: React.FC<BillSplitModalProps> = ({
  isOpen,
  onClose,
  currencySymbol = 'RM',
}) => {
  const [totalBill, setTotalBill] = useState('120.00');
  const [peopleCount, setPeopleCount] = useState('4');
  const [taxPercent, setTaxPercent] = useState('6'); // e.g. SST / PPN
  const [tipPercent, setTipPercent] = useState('10');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bill = parseFloat(totalBill) || 0;
  const people = Math.max(1, parseInt(peopleCount, 10) || 1);
  const tax = bill * ((parseFloat(taxPercent) || 0) / 100);
  const tip = bill * ((parseFloat(tipPercent) || 0) / 100);
  const grandTotal = bill + tax + tip;
  const perPerson = grandTotal / people;

  const handleCopyShare = () => {
    const text = `Bill Split (${currencySymbol}):\nTotal Bill: ${currencySymbol} ${bill.toFixed(2)}\nTax (${taxPercent}%): ${currencySymbol} ${tax.toFixed(2)}\nTip (${tipPercent}%): ${currencySymbol} ${tip.toFixed(2)}\nGrand Total: ${currencySymbol} ${grandTotal.toFixed(2)}\nJumlah Orang: ${people}\n👉 Patungan per orang: ${currencySymbol} ${perPerson.toFixed(2)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Bill Split
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hitung bagi rata tagihan & patungan
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Result Highlight Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 text-white text-center shadow-inner relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              PATUNGAN PER ORANG
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-white">
              {currencySymbol} {perPerson.toFixed(2)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Total {currencySymbol} {grandTotal.toFixed(2)} dibagi {people} orang
            </p>
          </div>

          {/* Total Bill Input */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Nominal Tagihan ({currencySymbol})
            </label>
            <Input
              type="number"
              step="any"
              value={totalBill}
              onChange={(e) => setTotalBill(e.target.value)}
              className="h-11 text-base font-bold"
              placeholder="0.00"
            />
          </div>

          {/* Number of People */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Jumlah Orang
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPeopleCount(String(num))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    people === num
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Tax & Tip */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Pajak / SST (%)
              </label>
              <Input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="h-11 text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Tip / Service (%)
              </label>
              <Input
                type="number"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                className="h-11 text-sm font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyShare}
              className="flex-1 h-11 text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-500" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span>Salin Rincian</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="h-11 px-5 text-sm font-medium"
            >
              Selesai
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
