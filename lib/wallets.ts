import { BankAccount, Transaction } from './types';

export const DEFAULT_WALLETS: BankAccount[] = [
  {
    id: 'wallet-tng',
    name: 'TnG',
    type: 'ewallet',
    categoryTag: 'BELANJE',
    initialBalance: 500.0,
    currency: 'MYR',
    colorTheme: 'dark',
    accountNumber: '•••• 8821',
    isDefault: true,
  },
  {
    id: 'wallet-jago',
    name: 'Bank Jago',
    type: 'bank',
    categoryTag: 'BELANJE',
    initialBalance: 429.47,
    currency: 'MYR',
    colorTheme: 'navy',
    accountNumber: '•••• 4029',
    isDefault: false,
  },
];

export const WALLET_STORAGE_KEY = 'cashflow_user_wallets_v1';
export const HIDE_BALANCE_KEY = 'cashflow_hide_balance_pref_v1';

export function getStoredWallets(userId?: string): BankAccount[] {
  if (typeof window === 'undefined') return DEFAULT_WALLETS;
  try {
    const key = userId ? `${WALLET_STORAGE_KEY}_${userId}` : WALLET_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading stored wallets:', err);
  }
  return DEFAULT_WALLETS;
}

export function saveStoredWallets(wallets: BankAccount[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = userId ? `${WALLET_STORAGE_KEY}_${userId}` : WALLET_STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(wallets));
    window.dispatchEvent(new Event('walletsUpdated'));
  } catch (err) {
    console.warn('Error saving stored wallets:', err);
  }
}

export function getStoredHideBalance(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(HIDE_BALANCE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredHideBalance(hide: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HIDE_BALANCE_KEY, hide ? 'true' : 'false');
    window.dispatchEvent(new Event('hideBalanceToggled'));
  } catch {
    // ignore
  }
}

/**
 * Calculates current balance, income and spending for a specific wallet account
 */
export function calculateWalletStats(
  wallet?: BankAccount | null,
  transactions?: Transaction[] | null
): {
  currentBalance: number;
  totalIncome: number;
  totalSpending: number;
} {
  let income = 0;
  let spending = 0;
  let balance = (wallet?.balance ?? wallet?.initialBalance) ?? 0;
  const targetWalletName = wallet?.name ?? '';

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter transactions related to this wallet (by account name or transfer target)
  safeTransactions.forEach((tx) => {
    if (!tx) return;
    const txAmount = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 0;

    // If this transaction is from this wallet
    if (targetWalletName && tx.account === targetWalletName) {
      if (tx.type === 'inflow') {
        income += txAmount;
        balance += txAmount;
      } else if (tx.type === 'outflow') {
        spending += txAmount;
        balance -= txAmount;
      }
    }

    // If this transaction is a transfer TO this wallet
    if (targetWalletName && tx.transferToAccount === targetWalletName && tx.account !== targetWalletName) {
      income += txAmount;
      balance += txAmount;
    }
  });

  return {
    currentBalance: Math.round(balance * 100) / 100,
    totalIncome: Math.round(income * 100) / 100,
    totalSpending: Math.round(spending * 100) / 100,
  };
}
