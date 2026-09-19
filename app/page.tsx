'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Transaction, 
  RecurringBill, 
  CashflowSummary,
  UserProfile 
} from '@/lib/types';
import { 
  getSupabaseClient, 
  getSupabaseCredentials,
  getLocalTransactions, 
  saveLocalTransactions, 
  getLocalRecurring, 
  saveLocalRecurring,
  getSupabaseUser,
  subscribeToAuthChanges,
  fetchUserTransactions,
  fetchUserRecurring,
  upsertUserTransaction,
  deleteUserTransaction,
  upsertUserRecurring,
  deleteUserRecurring,
  signOutUser
} from '@/lib/supabase';
import { 
  getStoredBaseCurrency, 
  refreshLiveExchangeRates,
  SUPPORTED_CURRENCIES
} from '@/lib/currency';
import { Header } from '@/components/Header';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { CashflowOverview } from '@/components/CashflowOverview';
import { TransactionList } from '@/components/TransactionList';
import { ForecastView } from '@/components/ForecastView';
import { RecurringManager } from '@/components/RecurringManager';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { SupabaseSyncModal } from '@/components/SupabaseSyncModal';
import { CurrencySettingsModal } from '@/components/CurrencySettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';

export default function CashflowApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  // Base currency state (defaults to IDR)
  const [baseCurrency, setBaseCurrency] = useState<string>(() => getStoredBaseCurrency());

  // Supabase Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // User-scoped transactions and recurring bills
  const [transactions, setTransactions] = useState<Transaction[]>(() => getLocalTransactions());
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => getLocalRecurring());

  // Supabase connection & sync states
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync with base currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      setBaseCurrency(getStoredBaseCurrency());
    };
    window.addEventListener('baseCurrencyChanged', handleCurrencyChange);
    // Background fetch fresh exchange rates
    refreshLiveExchangeRates();
    return () => {
      window.removeEventListener('baseCurrencyChanged', handleCurrencyChange);
    };
  }, []);

  // Check Supabase Auth session on mount and subscribe to changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const user = await getSupabaseUser();
        if (mounted) {
          setCurrentUser(user);
          setIsAuthLoading(false);
        }
      } catch (e) {
        if (mounted) setIsAuthLoading(false);
      }
    }

    initAuth();

    const unsubscribe = subscribeToAuthChanges((user) => {
      if (mounted) {
        setCurrentUser(user);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Reload transactions and recurring whenever currentUser changes
  const syncRemoteData = useCallback(async (user: UserProfile | null) => {
    const userId = user?.id;
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) return;

    const client = getSupabaseClient();
    if (!client) return;

    setIsSyncing(true);
    try {
      if (userId) {
        // Fetch user-scoped transactions
        const remoteTxs = await fetchUserTransactions(userId);
        if (remoteTxs.length > 0) {
          setTransactions(remoteTxs);
          saveLocalTransactions(remoteTxs, userId);
        }
        const remoteRec = await fetchUserRecurring(userId);
        if (remoteRec.length > 0) {
          setRecurringBills(remoteRec);
          saveLocalRecurring(remoteRec, userId);
        }
        setIsSupabaseConnected(true);
      } else {
        // Guest mode fallback
        const { data: remoteTxs, error: txError } = await client
          .from('cashflow_transactions')
          .select('*')
          .is('user_id', null)
          .order('date', { ascending: false });

        if (!txError && remoteTxs && remoteTxs.length > 0) {
          const mapped: Transaction[] = remoteTxs.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            type: r.type,
            amount: Number(r.amount),
            description: r.description,
            category: r.category,
            account: r.account,
            date: r.date,
            notes: r.notes,
            isRecurring: r.is_recurring,
            recurringId: r.recurring_id,
            currency: r.currency || 'IDR',
            originalAmount: r.original_amount ? Number(r.original_amount) : undefined,
            exchangeRate: r.exchange_rate ? Number(r.exchange_rate) : undefined,
            baseCurrency: r.base_currency || 'IDR',
            createdAt: r.created_at,
          }));
          setTransactions(mapped);
          saveLocalTransactions(mapped);
          setIsSupabaseConnected(true);
        } else if (!txError) {
          setIsSupabaseConnected(true);
        }
      }
    } catch (err) {
      console.warn('Supabase sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // When currentUser changes, update local state and fetch remote data
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const userId = currentUser?.id;
      // Load user-scoped local storage
      const localTxs = getLocalTransactions(userId);
      const localRec = getLocalRecurring(userId);
      if (!ignore) {
        setTransactions(localTxs);
        setRecurringBills(localRec);
      }
      await syncRemoteData(currentUser);
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [currentUser, syncRemoteData]);

  const handleManualSync = useCallback(async () => {
    const userId = currentUser?.id;
    setTransactions(getLocalTransactions(userId));
    setRecurringBills(getLocalRecurring(userId));
    await syncRemoteData(currentUser);
  }, [currentUser, syncRemoteData]);

  // Compute Cashflow Summary scaled to currency
  const summary: CashflowSummary = useMemo(() => {
    // Starting baseline reserve: IDR 45.000.000 or USD 12,500
    const baseStartingBalance = baseCurrency === 'IDR' ? 45000000 : 12500;
    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'inflow') {
        totalInflow += tx.amount;
      } else {
        totalOutflow += tx.amount;
      }
    });

    const netCashflow = totalInflow - totalOutflow;
    const currentBalance = baseStartingBalance + netCashflow;

    // Daily burn rate estimate
    const burnRateDaily = totalOutflow > 0 ? totalOutflow / 30 : (baseCurrency === 'IDR' ? 500000 : 50);
    const runwayDays = burnRateDaily > 0 ? Math.round(currentBalance / burnRateDaily) : 999;

    // Estimate month end
    const daysLeftInMonth = 14;
    const projectedMonthEnd = currentBalance - burnRateDaily * daysLeftInMonth;

    return {
      currentBalance,
      totalInflow,
      totalOutflow,
      netCashflow,
      burnRateDaily,
      runwayDays,
      projectedMonthEnd,
    };
  }, [transactions, baseCurrency]);

  // Handle Save / Edit Transaction (Filtered per user)
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    const userId = currentUser?.id;
    let updatedTxs: Transaction[];

    if (editingId) {
      updatedTxs = transactions.map((t) =>
        t.id === editingId
          ? { ...t, ...data, userId: userId || t.userId, updatedAt: new Date().toISOString() }
          : t
      );
    } else {
      const newTx: Transaction = {
        ...data,
        userId,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      updatedTxs = [newTx, ...transactions];
    }

    setTransactions(updatedTxs);
    saveLocalTransactions(updatedTxs, userId);

    // Sync with Supabase if connected
    const txToSync = editingId
      ? updatedTxs.find((t) => t.id === editingId)
      : updatedTxs[0];

    if (txToSync) {
      await upsertUserTransaction(txToSync, userId);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const userId = currentUser?.id;
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveLocalTransactions(updated, userId);

    await deleteUserTransaction(id, userId);
  };

  // Handle Add Recurring Bill (Filtered per user)
  const handleAddRecurring = async (billData: Omit<RecurringBill, 'id'>) => {
    const userId = currentUser?.id;
    const newBill: RecurringBill = {
      ...billData,
      userId,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [...recurringBills, newBill];
    setRecurringBills(updated);
    saveLocalRecurring(updated, userId);

    await upsertUserRecurring(newBill, userId);
  };

  // Handle Delete Recurring
  const handleDeleteRecurring = async (id: string) => {
    const userId = currentUser?.id;
    const updated = recurringBills.filter((b) => b.id !== id);
    setRecurringBills(updated);
    saveLocalRecurring(updated, userId);

    await deleteUserRecurring(id, userId);
  };

  // Handle "Mark as Paid" for Recurring Bill
  const handleMarkPaid = async (bill: RecurringBill) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = currentUser?.id;

    // 1. Record transaction immediately
    await handleSaveTransaction({
      type: bill.type,
      amount: bill.amount,
      description: `${bill.title} (Pembayaran Rutin)`,
      category: bill.category,
      account: bill.account,
      date: todayStr,
      isRecurring: true,
      recurringId: bill.id,
      currency: bill.currency || baseCurrency,
      baseCurrency,
      userId,
    });

    // 2. Advance next due date based on frequency
    const currentDue = new Date(bill.nextDueDate);
    const nextDate = new Date(currentDue);

    if (bill.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (bill.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else if (bill.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (bill.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (bill.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    const updatedBills = recurringBills.map((b) =>
      b.id === bill.id
        ? {
            ...b,
            nextDueDate: nextDate.toISOString().split('T')[0],
            lastPaidDate: todayStr,
          }
        : b
    );

    setRecurringBills(updatedBills);
    saveLocalRecurring(updatedBills, userId);

    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from('cashflow_recurring').update({
          next_due_date: nextDate.toISOString().split('T')[0],
          last_paid_date: todayStr,
        }).eq('id', bill.id);

        if (userId) {
          query = query.eq('user_id', userId);
        }
        await query;
      } catch (err) {
        console.error('Failed to advance recurring date in Supabase:', err);
      }
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex antialiased transition-colors duration-200">
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Desktop Permanent Navigation Sidebar (Hidden on Mobile Phone) */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        transactionCount={transactions.length}
        recurringCount={recurringBills.length}
        isSupabaseConnected={isSupabaseConnected}
        isSyncing={isSyncing}
        baseCurrency={baseCurrency}
      />

      {/* Main Application Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* App Header (Adaptive: Mobile clean header / Desktop top bar) */}
        <Header
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          isSupabaseConnected={isSupabaseConnected}
          isSyncing={isSyncing}
          baseCurrency={baseCurrency}
          onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
          activeTab={activeTab}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* User identification indicator banner on Mobile only if logged in */}
          {currentUser && (
            <div className="md:hidden mb-4 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                <span className="text-zinc-500 dark:text-zinc-400">Akun:</span>
                <strong className="text-zinc-950 dark:text-white font-bold truncate">
                  {currentUser.fullName || currentUser.email}
                </strong>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0 ml-2">
                Supabase
              </span>
            </div>
          )}

          {activeTab === 'overview' && (
            <CashflowOverview
              summary={summary}
              transactions={transactions}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              baseCurrency={baseCurrency}
              onOpenCurrencySettings={() => setIsCurrencyModalOpen(true)}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              baseCurrency={baseCurrency}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView
              currentBalance={summary.currentBalance}
              recurringBills={recurringBills}
              transactions={transactions}
              baseCurrency={baseCurrency}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringManager
              recurringBills={recurringBills}
              onAddRecurring={handleAddRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onMarkPaid={handleMarkPaid}
              baseCurrency={baseCurrency}
            />
          )}
        </main>
      </div>

      {/* Bottom Mobile Navigation Dock with Large FAB (Exclusively for Mobile Phone) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Supabase Auth Modal (Login / Register / Profile) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
        }}
        onOpenSupabaseConfig={() => setIsSyncModalOpen(true)}
      />

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currentBaseCurrency={baseCurrency}
        userId={currentUser?.id}
      />

      {/* Supabase Connection & SQL Setup Modal */}
      <SupabaseSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncTriggered={handleManualSync}
      />

      {/* Multi-Currency & Travel Exchange Rate Modal */}
      <CurrencySettingsModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentBaseCurrency={baseCurrency}
        onSelectBaseCurrency={(newCurr) => setBaseCurrency(newCurr)}
      />
    </div>
  );
}
