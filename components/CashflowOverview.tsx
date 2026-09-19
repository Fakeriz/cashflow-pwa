'use client';

import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Hourglass, 
  CreditCard, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Globe2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Transaction, CashflowSummary, Account } from '@/lib/types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MonthlyCashflowChart } from './MonthlyCashflowChart';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { RecentTransactionsCard } from './RecentTransactionsCard';

interface CashflowOverviewProps {
  summary: CashflowSummary;
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onNavigateTab: (tab: 'transactions' | 'forecast' | 'recurring') => void;
  baseCurrency?: string;
  onOpenCurrencySettings?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const CashflowOverview: React.FC<CashflowOverviewProps> = ({
  summary,
  transactions,
  onOpenAddModal,
  onNavigateTab,
  baseCurrency = 'IDR',
  onOpenCurrencySettings,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const isIDR = baseCurrency === 'IDR';

  // Realistic baseline balances based on currency
  const baseMultipler = isIDR ? 10000 : 1;
  const initialBalances: Record<Account, number> = {
    'Operating Account': 4500 * baseMultipler,
    'Checking Account': 2250 * baseMultipler,
    'Savings / Reserve': 6000 * baseMultipler,
    'Credit Card': -850 * baseMultipler,
    'Cash / Petty': 350 * baseMultipler,
  };

  const accountBalances: Record<Account, number> = { ...initialBalances };

  // Adjust account balances based on active transactions
  transactions.forEach((tx) => {
    if (accountBalances[tx.account] !== undefined) {
      if (tx.type === 'inflow') {
        accountBalances[tx.account] += tx.amount * 0.2;
      } else {
        accountBalances[tx.account] -= tx.amount * 0.2;
      }
    }
  });

  const isNetPositive = summary.netCashflow >= 0;
  const currencyInfo = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.IDR;

  // Primary Balance Element reusable for both Mobile and Desktop
  const balanceSummaryNode = (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-sm">
      <div className="relative z-10 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <Wallet className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Saldo Kas Likuid
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCurrencySettings && (
              <button
                type="button"
                onClick={onOpenCurrencySettings}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition"
                title="Ganti Mata Uang Dasar"
              >
                <Globe2 className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                <span>{currencyInfo.flag} {currencyInfo.code}</span>
              </button>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isNetPositive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {isNetPositive ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Net +{formatCurrency(summary.netCashflow, baseCurrency)}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Net {formatCurrency(summary.netCashflow, baseCurrency, { includeSign: true })}</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {formatCurrency(summary.currentBalance, baseCurrency)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Proyeksi Akhir Bulan:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {formatCurrency(summary.projectedMonthEnd, baseCurrency)}
            </span>
          </div>
        </div>

        {/* Quick Metrics Split (Monochrome) */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {/* Monthly Inflows */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>Total Pemasukan</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
              +{formatCurrency(summary.totalInflow, baseCurrency)}
            </div>
          </div>

          {/* Monthly Outflows */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
              <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 flex items-center justify-center">
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>Total Pengeluaran</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-zinc-700 dark:text-zinc-300">
              -{formatCurrency(summary.totalOutflow, baseCurrency)}
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            id="overview-add-cashflow-btn"
            onClick={onOpenAddModal}
            className="flex-1 h-11 text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Transaksi</span>
          </Button>
          <Button
            id="overview-forecast-shortcut-btn"
            variant="outline"
            onClick={() => onNavigateTab('forecast')}
            className="h-11 px-4 text-xs font-semibold"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-500 mr-1.5" />
            <span>Forecast 30 Hari</span>
          </Button>
        </div>
      </div>
    </div>
  );

  // Runway Card Reusable
  const runwayHealthNode = (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">Cash Runway & Kecepatan Kas</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Ketahanan saldo terhadap pengeluaran harian</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-zinc-950 dark:text-white">
              {summary.runwayDays > 365 ? '12+ Bulan' : `${summary.runwayDays} Hari`}
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Estimasi Runway</span>
          </div>
        </div>

        {/* Runway Progress Meter */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(10, (summary.runwayDays / 180) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>
              Burn Rate Harian: {formatCurrency(Math.round(summary.burnRateDaily), baseCurrency)}/hari
            </span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Likuiditas Stabil</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Accounts Liquidity Card Reusable
  const accountsNode = (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Alokasi Rekening & Dompet
        </h4>
        <button
          type="button"
          onClick={() => onNavigateTab('transactions')}
          className="text-xs text-zinc-700 dark:text-zinc-300 hover:underline font-semibold"
        >
          Lihat riwayat →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {(Object.keys(accountBalances) as Account[]).map((acc) => {
          const bal = accountBalances[acc];
          const isNegative = bal < 0;
          return (
            <div
              key={acc}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">{acc}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {acc.includes('Credit') ? 'Kewajiban / Liabilitas' : 'Aset Kas'}
                  </span>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  isNegative ? 'text-zinc-500 dark:text-zinc-400 line-through' : 'text-zinc-950 dark:text-white'
                }`}
              >
                {formatCurrency(bal, baseCurrency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300 w-full">
      {/* ============================================================ */}
      {/* 1. TAMPILAN MOBILE (PHONE) - SINGLE COLUMN COMPACT LAYOUT */}
      {/* ============================================================ */}
      <div className="flex flex-col space-y-4 max-w-lg mx-auto lg:hidden">
        {/* Saldo Utama */}
        {balanceSummaryNode}

        {/* Runway & Burn Health */}
        {runwayHealthNode}

        {/* Rekening & Dompet */}
        {accountsNode}

        {/* Grafik Ringkas Cashflow Bulanan */}
        <MonthlyCashflowChart 
          transactions={transactions} 
          baseCurrency={baseCurrency} 
        />

        {/* Transaksi Terakhir */}
        <RecentTransactionsCard
          transactions={transactions}
          onViewAll={() => onNavigateTab('transactions')}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          baseCurrency={baseCurrency}
        />

        {/* Breakdown Kategori */}
        <CategoryBreakdownCard
          transactions={transactions}
          baseCurrency={baseCurrency}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. TAMPILAN WEB / DESKTOP (LAYAR LEBAR lg:) - 2-KOLOM GRID */}
      {/* ============================================================ */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start w-full">
        {/* KOLOM KIRI (7 Kolom): Ringkasan Saldo, Chart/Grafik Cashflow Bulanan, Tombol Transaksi, Runway, Rekening */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* Ringkasan Saldo & Quick Action */}
          {balanceSummaryNode}

          {/* Chart / Grafik Cashflow Bulanan */}
          <MonthlyCashflowChart
            transactions={transactions}
            baseCurrency={baseCurrency}
          />

          {/* Runway Ketahanan Kas */}
          {runwayHealthNode}

          {/* Alokasi Rekening & Dompet */}
          {accountsNode}
        </div>

        {/* KOLOM KANAN (5 Kolom): Daftar Transaksi Terakhir (History) & Breakdown Kategori */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Daftar Transaksi Terakhir (History) */}
          <RecentTransactionsCard
            transactions={transactions}
            onViewAll={() => onNavigateTab('transactions')}
            onEditTransaction={onEditTransaction}
            onDeleteTransaction={onDeleteTransaction}
            baseCurrency={baseCurrency}
          />

          {/* Breakdown Kategori Pengeluaran & Pemasukan */}
          <CategoryBreakdownCard
            transactions={transactions}
            baseCurrency={baseCurrency}
          />
        </div>
      </div>
    </div>
  );
};
