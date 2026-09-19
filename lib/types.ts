export type TransactionType = 'inflow' | 'outflow';

export type Category = 
  // Indonesian Categories (primary)
  | 'Makanan'
  | 'Transportasi'
  | 'Tagihan'
  | 'Belanja'
  | 'Tempat Tinggal'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Hiburan'
  | 'Gaji'
  | 'Bisnis & Klien'
  | 'Penjualan'
  | 'Investasi'
  | 'Pajak & Biaya'
  | 'Lainnya'
  // Compatibility with previous English categories
  | 'Income'
  | 'Client Work'
  | 'Sales'
  | 'Investment'
  | 'Housing & Rent'
  | 'Payroll & Team'
  | 'Software & SaaS'
  | 'Marketing & Ads'
  | 'Office & Equipment'
  | 'Food & Dining'
  | 'Utilities'
  | 'Taxes'
  | 'Other';

export type Account = 'Checking Account' | 'Operating Account' | 'Savings / Reserve' | 'Credit Card' | 'Cash / Petty' | 'Bank Jago' | 'TnG' | string;

export interface BankAccount {
  id: string;
  userId?: string;
  name: string; // e.g. 'Bank Jago', 'TnG', 'BCA', 'Mandiri', 'GoPay'
  type: 'bank' | 'ewallet' | 'cash' | 'card';
  categoryTag?: string; // e.g. 'BELANJE', 'UTAMA', 'TABUNGAN'
  initialBalance: number;
  balance?: number; // optional alias for initialBalance or computed balance
  currency: string;
  colorTheme?: 'dark' | 'navy' | 'emerald' | 'purple' | 'slate' | 'amber';
  accountNumber?: string;
  isDefault?: boolean;
}

export type AccountItem = BankAccount;

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
  decimals: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number; // Stored in base currency (IDR) for calculation consistency
  description: string;
  category: Category;
  account: Account;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Multi-currency tracking
  currency?: string; // e.g. 'IDR', 'USD', 'SGD', 'MYR'
  originalAmount?: number; // amount in foreign/transaction currency
  exchangeRate?: number; // 1 foreign currency = X base currency (e.g. 1 USD = 16300 IDR)
  baseCurrency?: string; // base currency code at time of transaction
  time?: string; // e.g. '12:09 PM'
  transferToAccount?: string; // for transfer between accounts
}

export interface RecurringBill {
  id: string;
  userId?: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: Category;
  account: Account;
  frequency: RecurrenceFrequency;
  nextDueDate: string; // YYYY-MM-DD
  autoRecord?: boolean;
  lastPaidDate?: string;
  notes?: string;
  currency?: string;
}

export interface CashflowSummary {
  currentBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashflow: number;
  burnRateDaily: number;
  runwayDays: number;
  projectedMonthEnd: number;
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  inflow: number;
  outflow: number;
  net: number;
  projectedBalance: number;
  events: string[];
}
