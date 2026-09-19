'use client';

import React, { useState } from 'react';
import { 
  X, 
  Globe2, 
  RefreshCw, 
  Check, 
  Plane, 
  ArrowRightLeft,
  TrendingUp
} from 'lucide-react';
import { 
  SUPPORTED_CURRENCIES, 
  setStoredBaseCurrency, 
  getExchangeRate, 
  formatCurrency, 
  refreshLiveExchangeRates 
} from '@/lib/currency';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CurrencySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBaseCurrency: string;
  onSelectBaseCurrency: (currencyCode: string) => void;
}

export const CurrencySettingsModal: React.FC<CurrencySettingsModalProps> = ({
  isOpen,
  onClose,
  currentBaseCurrency,
  onSelectBaseCurrency,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(currentBaseCurrency);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Kurs Realistis');

  // Quick Travel Converter Calculator
  const [calcAmount, setCalcAmount] = useState<string>('50');
  const [fromCurr, setFromCurr] = useState<string>('SGD');
  const [toCurr, setToCurr] = useState<string>('IDR');

  if (!isOpen) return null;

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    const result = await refreshLiveExchangeRates();
    setIsRefreshing(false);
    if (result.success && result.date) {
      setLastRefreshed(`Diperbarui: ${result.date}`);
    } else {
      setLastRefreshed('Kurs otomatis diperbarui');
    }
  };

  const handleSaveBase = (code: string) => {
    setSelectedCurrency(code);
    setStoredBaseCurrency(code);
    onSelectBaseCurrency(code);
  };

  // Quick Converter Calculation
  const numCalc = parseFloat(calcAmount) || 0;
  const convertedCalc = numCalc * getExchangeRate(fromCurr, toCurr);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5 text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Multi-Currency & Valas</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pengaturan mata uang utama & konversi kurs luar negeri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Base Currency Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Pilih Mata Uang Utama (Home Base)
            </label>
            <span className="text-[11px] font-bold text-zinc-950 dark:text-white">
              Aktif: {selectedCurrency}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Semua transaksi asing akan otomatis dikonversikan dan diakumulasikan ke mata uang ini.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {Object.values(SUPPORTED_CURRENCIES).map((c) => {
              const isSelected = selectedCurrency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleSaveBase(c.code)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-sm font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{c.flag}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{c.code}</span>
                      <span className={`text-[10px] truncate block ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {c.symbol}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Exchange Rate Board */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <TrendingUp className="w-4 h-4" />
              <span>Daftar Nilai Tukar Terkini (Relatif ke {selectedCurrency})</span>
            </div>
            <button
              onClick={handleRefreshRates}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Mengambil...' : 'Update Kurs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.values(SUPPORTED_CURRENCIES)
              .filter((c) => c.code !== selectedCurrency)
              .slice(0, 8)
              .map((c) => {
                const rate = getExchangeRate(c.code, selectedCurrency);
                return (
                  <div
                    key={c.code}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl-sm"
                  >
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <span>{c.flag}</span>
                      <span>1 {c.code}</span>
                    </span>
                    <span className="font-bold text-zinc-950 dark:text-white text-[11px]">
                      {formatCurrency(rate, selectedCurrency)}
                    </span>
                  </div>
                );
              })}
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block text-right">
            {lastRefreshed}
          </span>
        </div>

        {/* Quick Travel Calculator */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <span className="text-xs font-bold text-zinc-950 dark:text-white">
              Kalkulator Cepat Valas Luar Negeri
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Dari</label>
              <div className="flex gap-1">
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-18 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 px-2 font-medium"
                >
                  {Object.keys(SUPPORTED_CURRENCIES).map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                />
              </div>
            </div>

            <div className="col-span-1 flex justify-center pt-3">
              <button
                type="button"
                onClick={() => {
                  const temp = fromCurr;
                  setFromCurr(toCurr);
                  setToCurr(temp);
                }}
                className="p-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition"
                title="Tukar mata uang"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Ke</label>
              <div className="flex gap-1">
                <select
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="w-18 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 px-2 font-medium"
                >
                  {Object.keys(SUPPORTED_CURRENCIES).map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <div className="h-9 flex items-center px-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-950 dark:text-white truncate flex-1">
                  {formatCurrency(convertedCalc, toCurr)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <Button onClick={onClose} className="w-full h-11 text-sm font-medium">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
};
