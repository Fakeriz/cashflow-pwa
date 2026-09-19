'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { Transaction, CashflowSummary, Account, BankAccount } from '@/lib/types';
import { formatCurrency, SUPPORTED_CURRENCIES } from '@/lib/currency';
import { 
  DEFAULT_WALLETS,
  getStoredWallets, 
  saveStoredWallets, 
  getStoredHideBalance, 
  setStoredHideBalance,
  calculateWalletStats 
} from '@/lib/wallets';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { WalletCardDeck } from './WalletCardDeck';
import { QuickActionGrid } from './QuickActionGrid';
import { AccountRecentTransactions } from './AccountRecentTransactions';
import { AddWalletModal } from './AddWalletModal';
import { MoveFundsModal } from './MoveFundsModal';
import { BillSplitModal } from './BillSplitModal';
import { ReceiptsModal } from './ReceiptsModal';
import { PulseModal } from './PulseModal';
import { MonthlyCashflowChart } from './MonthlyCashflowChart';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';

interface CashflowOverviewProps {
  summary: CashflowSummary;
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onNavigateTab: (tab: 'transactions' | 'forecast' | 'recurring') => void;
  baseCurrency?: string;
  onOpenCurrencySettings?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onAddTransactionDirect?: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const CashflowOverview: React.FC<CashflowOverviewProps> = ({
  summary,
  transactions,
  onOpenAddModal,
  onNavigateTab,
  baseCurrency = 'MYR',
  onOpenCurrencySettings,
  onEditTransaction,
  onDeleteTransaction,
  onAddTransactionDirect,
}) => {
  // Wallet Accounts state
  const [wallets, setWallets] = useState<BankAccount[]>(() => getStoredWallets());
  const [activeWalletIndex, setActiveWalletIndex] = useState<number>(0);
  const [hideBalance, setHideBalance] = useState<boolean>(() => getStoredHideBalance());

  // Modals state
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<BankAccount | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBillSplitModalOpen, setIsBillSplitModalOpen] = useState(false);
  const [isReceiptsModalOpen, setIsReceiptsModalOpen] = useState(false);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [pulseTargetWallet, setPulseTargetWallet] = useState<BankAccount | null>(null);
  const [showAnalyticsSection, setShowAnalyticsSection] = useState(false);

  // Sync wallets from localStorage updates
  useEffect(() => {
    const handleWalletsUpdated = () => {
      setWallets(getStoredWallets());
    };
    const handleHideBalanceToggled = () => {
      setHideBalance(getStoredHideBalance());
    };

    window.addEventListener('walletsUpdated', handleWalletsUpdated);
    window.addEventListener('hideBalanceToggled', handleHideBalanceToggled);
    return () => {
      window.removeEventListener('walletsUpdated', handleWalletsUpdated);
      window.removeEventListener('hideBalanceToggled', handleHideBalanceToggled);
    };
  }, []);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeWallets = Array.isArray(wallets) && wallets.length > 0 ? wallets : DEFAULT_WALLETS;
  const activeWallet = safeWallets[activeWalletIndex] || safeWallets[0] || DEFAULT_WALLETS[0];

  const handleToggleHideBalance = () => {
    const next = !hideBalance;
    setHideBalance(next);
    setStoredHideBalance(next);
  };

  const handleSaveWallet = (newOrUpdated: BankAccount) => {
    let updatedList: BankAccount[];
    const existingIndex = wallets.findIndex((w) => w.id === newOrUpdated.id);

    if (existingIndex >= 0) {
      updatedList = [...wallets];
      updatedList[existingIndex] = newOrUpdated;
    } else {
      updatedList = [...wallets, newOrUpdated];
      // Switch active to the newly created wallet
      setActiveWalletIndex(updatedList.length - 1);
    }

    setWallets(updatedList);
    saveStoredWallets(updatedList);
    setEditingWallet(null);
  };

  const handleDeleteWallet = (walletId: string) => {
    const updated = wallets.filter((w) => w.id !== walletId);
    if (updated.length === 0) return;
    setWallets(updated);
    saveStoredWallets(updated);
    setActiveWalletIndex(0);
  };

  const handleTransfer = (data: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    description: string;
    notes: string;
    date: string;
    time: string;
    currency: string;
  }) => {
    if (onAddTransactionDirect) {
      // Record transfer transaction
      onAddTransactionDirect({
        type: 'outflow',
        amount: data.amount,
        description: data.description,
        notes: data.notes,
        category: 'Lainnya',
        account: data.fromAccount,
        transferToAccount: data.toAccount,
        date: data.date,
        time: data.time,
        currency: data.currency,
      });
    }
  };

  const handleOpenPulse = (wallet: BankAccount) => {
    setPulseTargetWallet(wallet);
    setIsPulseModalOpen(true);
  };

  const currSymbol = (activeWallet?.currency || baseCurrency) === 'MYR' ? 'RM' : 'Rp';

  return (
    <div className="animate-in fade-in duration-300 w-full pb-8">
      {/* ============================================================ */}
      {/* 1. TAMPILAN MOBILE & DESKTOP CORE (Exact Screenshot Layout) */}
      {/* ============================================================ */}
      <div className="w-full max-w-xl mx-auto space-y-4">
        {/* SWIPEABLE WALLET CARDS DECK */}
        <WalletCardDeck
          wallets={safeWallets}
          activeWalletIndex={activeWalletIndex}
          onSelectWallet={(idx) => setActiveWalletIndex(idx)}
          onOpenAddWalletModal={() => {
            setEditingWallet(null);
            setIsAddWalletModalOpen(true);
          }}
          onOpenPulseModal={handleOpenPulse}
          transactions={safeTransactions}
          hideBalance={hideBalance}
          onToggleHideBalance={handleToggleHideBalance}
        />

        {/* 4 QUICK ACTION BUTTONS (Bills, Receipts, Bill Split, Analytics) */}
        <QuickActionGrid
          onOpenBills={() => onNavigateTab('recurring')}
          onOpenReceipts={() => setIsReceiptsModalOpen(true)}
          onOpenBillSplit={() => setIsBillSplitModalOpen(true)}
          onOpenAnalytics={() => setShowAnalyticsSection(!showAnalyticsSection)}
        />

        {/* RECENT TRANSACTIONS FOR CURRENT WALLET (Recent · TnG) */}
        {activeWallet && (
          <AccountRecentTransactions
            activeWallet={activeWallet}
            transactions={safeTransactions}
            onOpenMoveModal={() => setIsMoveModalOpen(true)}
            onViewAll={() => onNavigateTab('transactions')}
            onOpenAddModal={onOpenAddModal}
            onEditTransaction={onEditTransaction}
            onDeleteTransaction={onDeleteTransaction}
            hideBalance={hideBalance}
          />
        )}

        {/* TOGGLEABLE / EXTENDED ANALYTICS & CHARTS SECTION */}
        {showAnalyticsSection && (
          <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
                <span>Analisis & Visualisasi Cashflow</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAnalyticsSection(false)}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
              >
                Tutup
              </button>
            </div>

            <MonthlyCashflowChart 
              transactions={safeTransactions} 
              baseCurrency={baseCurrency} 
            />

            <CategoryBreakdownCard
              transactions={safeTransactions}
              baseCurrency={baseCurrency}
            />
          </div>
        )}

        {/* DESKTOP WIDE VIEW COMPLEMENTARY CARDS */}
        <div className="hidden lg:grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <MonthlyCashflowChart 
            transactions={safeTransactions} 
            baseCurrency={baseCurrency} 
          />

          <CategoryBreakdownCard
            transactions={safeTransactions}
            baseCurrency={baseCurrency}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* Add / Edit Wallet Modal */}
      <AddWalletModal
        isOpen={isAddWalletModalOpen}
        onClose={() => {
          setIsAddWalletModalOpen(false);
          setEditingWallet(null);
        }}
        onSave={handleSaveWallet}
        onDelete={handleDeleteWallet}
        editingWallet={editingWallet}
        baseCurrency={baseCurrency}
      />

      {/* Move Funds / Transfer Modal */}
      {activeWallet && (
        <MoveFundsModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          wallets={safeWallets}
          activeWallet={activeWallet}
          onTransfer={handleTransfer}
        />
      )}

      {/* Bill Split Modal */}
      <BillSplitModal
        isOpen={isBillSplitModalOpen}
        onClose={() => setIsBillSplitModalOpen(false)}
        currencySymbol={currSymbol}
      />

      {/* Receipts Manager Modal */}
      <ReceiptsModal
        isOpen={isReceiptsModalOpen}
        onClose={() => setIsReceiptsModalOpen(false)}
        currencySymbol={currSymbol}
      />

      {/* Pulse & Health Modal */}
      <PulseModal
        isOpen={isPulseModalOpen}
        onClose={() => {
          setIsPulseModalOpen(false);
          setPulseTargetWallet(null);
        }}
        wallet={pulseTargetWallet || activeWallet}
        transactions={safeTransactions}
        onOpenMoveModal={() => setIsMoveModalOpen(true)}
        onOpenAddTransaction={onOpenAddModal}
      />
    </div>
  );
};
