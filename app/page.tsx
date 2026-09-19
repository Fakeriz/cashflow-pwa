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
  INITIAL_TRANSACTIONS,
  INITIAL_RECURRING,
  getSupabaseUser,
  subscribeToAuthChanges,
  fetchUserTransactions,
  fetchUserRecurring,
  upsertUserTransaction,
  deleteUserTransaction,
  upsertUserRecurring,
  deleteUserRecurring,
  signOutUser,
  isPasswordRecoveryUrl,
  clearRecoveryUrlParams
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
import { UpdatePasswordModal } from '@/components/UpdatePasswordModal';
import { KeyRound } from 'lucide-react';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { NotificationsModal } from '@/components/NotificationsModal';
import { MoreMenuModal } from '@/components/MoreMenuModal';
import { AddWalletModal } from '@/components/AddWalletModal';
import { AppSkeletonLoader } from '@/components/AppSkeletonLoader';
import { getStoredWallets, saveStoredWallets } from '@/lib/wallets';
import { BankAccount } from '@/lib/types';

export default function CashflowApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  // Base currency state (defaults to MYR matching multi-wallet deck)
  const [baseCurrency, setBaseCurrency] = useState<string>(() => getStoredBaseCurrency());

  // Supabase Auth state & loading states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // User-scoped transactions, recurring bills, and accounts/wallets
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      return getLocalTransactions() || [];
    } catch {
      return [];
    }
  });
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      return getLocalRecurring() || [];
    } catch {
      return [];
    }
  });
  const [wallets, setWallets] = useState<BankAccount[]>(() => {
    try {
      return getStoredWallets() || [];
    } catch {
      return [];
    }
  });

  const accounts: BankAccount[] = useMemo(
    () => (Array.isArray(wallets) && wallets.length > 0 ? wallets : []),
    [wallets]
  );

  // Supabase connection & sync states
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);
  const [isRecoveryFlowActive, setIsRecoveryFlowActive] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isMoreMenuModalOpen, setIsMoreMenuModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
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

  // Callback when password has been successfully updated
  const handlePasswordUpdateSuccess = useCallback(() => {
    setIsUpdatePasswordModalOpen(false);
    setIsRecoveryFlowActive(false);
    clearRecoveryUrlParams();
    setActiveTab('overview'); // Ensure user is directed to Home
  }, []);

  // Check Supabase Auth session on mount and subscribe to changes safely
  useEffect(() => {
    let mounted = true;

    // 1. Detect URL recovery parameters (#access_token=...&type=recovery or ?type=recovery)
    // before any premature redirect occurs
    if (isPasswordRecoveryUrl()) {
      setIsRecoveryFlowActive(true);
      setIsUpdatePasswordModalOpen(true);
    }

    async function initAuth() {
      try {
        const user = await getSupabaseUser();
        if (mounted) {
          setCurrentUser(user);
          setIsAuthLoading(false);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Auth initialization caught safe fallback:', e);
        if (mounted) {
          setCurrentUser(null);
          setIsAuthLoading(false);
          setIsLoading(false);
        }
      }
    }

    initAuth();

    let unsubscribe = () => {};
    try {
      // 2. Catch Auth Event 'PASSWORD_RECOVERY' from Supabase Auth listener
      unsubscribe = subscribeToAuthChanges(
        (user, event) => {
          if (mounted) {
            if (event === 'PASSWORD_RECOVERY') {
              setIsRecoveryFlowActive(true);
              setIsUpdatePasswordModalOpen(true);
            }
            setCurrentUser(user);
          }
        },
        () => {
          if (mounted) {
            setIsRecoveryFlowActive(true);
            setIsUpdatePasswordModalOpen(true);
          }
        }
      );
    } catch (err) {
      console.warn('Caught subscription setup error:', err);
    }

    return () => {
      mounted = false;
      try {
        unsubscribe();
      } catch {
        // Safe cleanup
      }
    };
  }, []);

  // Reload transactions and recurring whenever currentUser changes
  const syncRemoteData = useCallback(async (user: UserProfile | null) => {
    const userId = user?.id;
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) return;

    try {
      const client = getSupabaseClient();
      if (!client) return;

      setIsSyncing(true);
      if (userId) {
        // Fetch user-scoped transactions
        const remoteTxs = await fetchUserTransactions(userId);
        if (remoteTxs && remoteTxs.length > 0) {
          setTransactions(remoteTxs);
          saveLocalTransactions(remoteTxs, userId);
        }
        const remoteRec = await fetchUserRecurring(userId);
        if (remoteRec && remoteRec.length > 0) {
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
          const mapped: Transaction[] = (remoteTxs || []).map((r: any) => ({
            id: r?.id,
            userId: r?.user_id,
            type: r?.type,
            amount: Number(r?.amount) || 0,
            description: r?.description || '',
            category: r?.category || 'Lainnya',
            account: r?.account || 'Utama',
            date: r?.date,
            notes: r?.notes,
            isRecurring: r?.is_recurring,
            recurringId: r?.recurring_id,
            currency: r?.currency || 'IDR',
            originalAmount: r?.original_amount ? Number(r.original_amount) : undefined,
            exchangeRate: r?.exchange_rate ? Number(r.exchange_rate) : undefined,
            baseCurrency: r?.base_currency || 'IDR',
            createdAt: r?.created_at,
          }));
          setTransactions(mapped);
          saveLocalTransactions(mapped);
          setIsSupabaseConnected(true);
        } else if (!txError) {
          setIsSupabaseConnected(true);
        }
      }
    } catch (err) {
      console.warn('Supabase sync error (non-fatal):', err);
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
    // Starting baseline reserve from accounts or default currency reserve
    const accountsBalance = (accounts || []).reduce(
      (sum, acc) => sum + (acc?.balance ?? acc?.initialBalance ?? 0),
      0
    );
    const primaryAccountBalance = accounts?.[0]?.balance ?? accounts?.[0]?.initialBalance ?? 0;
    const baseStartingBalance = accountsBalance > 0
      ? accountsBalance
      : (baseCurrency === 'IDR' ? 45000000 : 12500);

    let totalInflow = 0;
    let totalOutflow = 0;

    const safeTxs = Array.isArray(transactions) ? transactions : [];
    (safeTxs || []).forEach((tx) => {
      if (!tx) return;
      const amt = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 0;
      if (tx.type === 'inflow') {
        totalInflow += amt;
      } else {
        totalOutflow += amt;
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
  }, [transactions, baseCurrency, accounts]);

  // Handle Save / Edit Transaction (Filtered per user)
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    const userId = currentUser?.id;
    let updatedTxs: Transaction[];
    const safeTxs = Array.isArray(transactions) ? transactions : [];

    if (editingId) {
      updatedTxs = safeTxs.map((t) =>
        t?.id === editingId
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
      updatedTxs = [newTx, ...safeTxs];
    }

    setTransactions(updatedTxs);
    saveLocalTransactions(updatedTxs, userId);

    // Sync with Supabase if connected
    const txToSync = editingId
      ? updatedTxs.find((t) => t?.id === editingId)
      : updatedTxs[0];

    if (txToSync) {
      await upsertUserTransaction(txToSync, userId);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const userId = currentUser?.id;
    const safeTxs = Array.isArray(transactions) ? transactions : [];
    const updated = safeTxs.filter((t) => t?.id !== id);
    setTransactions(updated);
    saveLocalTransactions(updated, userId);

    await deleteUserTransaction(id, userId);
  };

  // Handle Add Recurring Bill (Filtered per user)
  const handleAddRecurring = async (billData: Omit<RecurringBill, 'id'>) => {
    const userId = currentUser?.id;
    const safeBills = Array.isArray(recurringBills) ? recurringBills : [];
    const newBill: RecurringBill = {
      ...billData,
      userId,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [...safeBills, newBill];
    setRecurringBills(updated);
    saveLocalRecurring(updated, userId);

    await upsertUserRecurring(newBill, userId);
  };

  // Handle Delete Recurring
  const handleDeleteRecurring = async (id: string) => {
    const userId = currentUser?.id;
    const safeBills = Array.isArray(recurringBills) ? recurringBills : [];
    const updated = safeBills.filter((b) => b?.id !== id);
    setRecurringBills(updated);
    saveLocalRecurring(updated, userId);

    await deleteUserRecurring(id, userId);
  };

  // Handle "Mark as Paid" for Recurring Bill
  const handleMarkPaid = async (bill: RecurringBill) => {
    if (!bill) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = currentUser?.id;

    // 1. Record transaction immediately
    await handleSaveTransaction({
      type: bill.type || 'outflow',
      amount: Number(bill.amount) || 0,
      description: `${bill.title || 'Tagihan'} (Pembayaran Rutin)`,
      category: bill.category || 'Tagihan',
      account: bill.account || 'Checking Account',
      date: todayStr,
      isRecurring: true,
      recurringId: bill.id,
      currency: bill.currency || baseCurrency,
      baseCurrency,
      userId,
    });

    // 2. Advance next due date based on frequency
    const currentDue = new Date(bill.nextDueDate || todayStr);
    const nextDate = new Date(currentDue);

    if (bill.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (bill.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else if (bill.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (bill.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
    else if (bill.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

    const safeBills = Array.isArray(recurringBills) ? recurringBills : [];
    const updatedBills = safeBills.map((b) =>
      b?.id === bill.id
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

  // Render Skeleton Loader if still determining auth/session state
  if (isLoading) {
    return <AppSkeletonLoader />;
  }

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
        onOpenMoreMenu={() => setIsMoreMenuModalOpen(true)}
        transactionCount={transactions?.length || 0}
        recurringCount={recurringBills?.length || 0}
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
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        />

        {/* Sticky Password Recovery Notification Banner if recovery mode is active */}
        {isRecoveryFlowActive && (
          <div 
            id="banner-password-recovery"
            className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-4 py-2.5 text-xs flex items-center justify-between border-b border-zinc-800 dark:border-zinc-200 sticky top-0 z-30 shadow-md animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Sesi pemulihan akun aktif. Harap perbarui kata sandi Anda.</span>
            </div>
            <button
              id="btn-open-recovery-from-banner"
              onClick={() => setIsUpdatePasswordModalOpen(true)}
              className="underline text-xs font-bold hover:opacity-80 transition ml-3 shrink-0 cursor-pointer"
            >
              Ganti Kata Sandi
            </button>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* User identification indicator banner on Mobile only if logged in */}
          {currentUser && (
            <div className="md:hidden mb-4 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                <span className="text-zinc-500 dark:text-zinc-400">Akun:</span>
                <strong className="text-zinc-950 dark:text-white font-bold truncate">
                  {currentUser?.fullName || currentUser?.email || 'Akun'}
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
              onAddTransactionDirect={(tx) => handleSaveTransaction(tx)}
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
        onOpenMoreMenu={() => setIsMoreMenuModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />

      {/* More / Settings Menu Modal */}
      <MoreMenuModal
        isOpen={isMoreMenuModalOpen}
        onClose={() => setIsMoreMenuModalOpen(false)}
        onOpenAddWallet={() => setIsAddWalletModalOpen(true)}
        onOpenRecurring={() => setActiveTab('recurring')}
        onOpenCurrency={() => setIsCurrencyModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        baseCurrency={baseCurrency}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Add Wallet Modal (Global trigger from More menu) */}
      <AddWalletModal
        isOpen={isAddWalletModalOpen}
        onClose={() => setIsAddWalletModalOpen(false)}
        onSave={(wallet) => {
          const current = getStoredWallets();
          const updated = [...current, wallet];
          saveStoredWallets(updated);
          setIsAddWalletModalOpen(false);
        }}
        baseCurrency={baseCurrency}
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
        onOpenUpdatePassword={() => setIsUpdatePasswordModalOpen(true)}
      />

      {/* Update Password Modal ("Ganti Kata Sandi Baru" for Recovery or Settings) */}
      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
        onSuccess={handlePasswordUpdateSuccess}
        onOpenForgotPassword={() => setIsAuthModalOpen(true)}
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
