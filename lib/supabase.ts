import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Transaction, RecurringBill, UserProfile } from './types';

// Storage keys for local fallback or override
const SUPABASE_URL_KEY = 'cashflow_supabase_url';
const SUPABASE_KEY_KEY = 'cashflow_supabase_anon_key';
const LOCAL_TRANSACTIONS_KEY = 'cashflow_local_transactions_v4';
const LOCAL_RECURRING_KEY = 'cashflow_local_recurring_v3';

// Initial realistic seed data with TnG and Bank Jago multi-wallet demo
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-tng-food',
    type: 'outflow',
    amount: 6.00,
    description: 'Food & Dining',
    category: 'Food & Dining',
    account: 'TnG',
    date: '2026-09-18',
    time: '12:10 PM',
    notes: 'Food & Dining',
    currency: 'MYR',
    createdAt: '2026-09-18T12:10:00.000Z',
  },
  {
    id: 'tx-tng-transfer',
    type: 'outflow',
    amount: 275.00,
    description: 'TnG → Bank Jago',
    category: 'Lainnya',
    account: 'TnG',
    transferToAccount: 'Bank Jago',
    date: '2026-09-18',
    time: '12:09 PM',
    notes: 'New Transfer',
    currency: 'MYR',
    createdAt: '2026-09-18T12:09:00.000Z',
  },
  {
    id: 'tx-1',
    type: 'inflow',
    amount: 17500000,
    description: 'Pembayaran Klien - Proyek Aplikasi Web',
    category: 'Bisnis & Klien',
    account: 'Operating Account',
    date: '2026-09-17',
    isRecurring: true,
    currency: 'IDR',
    createdAt: '2026-09-17T09:00:00.000Z',
  },
  {
    id: 'tx-2',
    type: 'outflow',
    amount: 464550,
    description: 'Makan Malam di Luar Negeri (Transit Singapore)',
    category: 'Makanan',
    account: 'Credit Card',
    date: '2026-09-16',
    isRecurring: false,
    currency: 'SGD',
    originalAmount: 37.31,
    exchangeRate: 12450,
    baseCurrency: 'IDR',
    createdAt: '2026-09-16T19:30:00.000Z',
  },
  {
    id: 'tx-3',
    type: 'outflow',
    amount: 65000,
    description: 'Makan Siang & Kopi Santai',
    category: 'Makanan',
    account: 'Checking Account',
    date: '2026-09-15',
    isRecurring: false,
    currency: 'IDR',
    createdAt: '2026-09-15T13:00:00.000Z',
  },
  {
    id: 'tx-4',
    type: 'outflow',
    amount: 45000,
    description: 'Ongkos Grab / Transportasi Kerja',
    category: 'Transportasi',
    account: 'Cash / Petty',
    date: '2026-09-14',
    isRecurring: false,
    currency: 'IDR',
    createdAt: '2026-09-14T08:30:00.000Z',
  },
  {
    id: 'tx-5',
    type: 'outflow',
    amount: 425000,
    description: 'Tagihan Listrik PLN & Air Bulanan',
    category: 'Tagihan',
    account: 'Checking Account',
    date: '2026-09-13',
    isRecurring: true,
    currency: 'IDR',
    createdAt: '2026-09-13T10:00:00.000Z',
  },
  {
    id: 'tx-6',
    type: 'outflow',
    amount: 326000,
    description: 'Langganan Server Cloud (AWS / DigitalOcean $20)',
    category: 'Software & SaaS',
    account: 'Credit Card',
    date: '2026-09-12',
    isRecurring: true,
    currency: 'USD',
    originalAmount: 20,
    exchangeRate: 16300,
    baseCurrency: 'IDR',
    createdAt: '2026-09-12T15:00:00.000Z',
  },
  {
    id: 'tx-7',
    type: 'inflow',
    amount: 3500000,
    description: 'Penjualan Template & Aset Digital',
    category: 'Penjualan',
    account: 'Checking Account',
    date: '2026-09-10',
    isRecurring: false,
    currency: 'IDR',
    createdAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'tx-8',
    type: 'outflow',
    amount: 350000,
    description: 'Tagihan Internet WiFi Fiber Optik',
    category: 'Tagihan',
    account: 'Checking Account',
    date: '2026-09-08',
    isRecurring: true,
    currency: 'IDR',
    createdAt: '2026-09-08T14:00:00.000Z',
  }
];

export const INITIAL_RECURRING: RecurringBill[] = [
  {
    id: 'rec-1',
    title: 'Retainer Klien Bulanan',
    type: 'inflow',
    amount: 17500000,
    category: 'Bisnis & Klien',
    account: 'Operating Account',
    frequency: 'monthly',
    nextDueDate: '2026-09-28',
    autoRecord: true,
    currency: 'IDR',
  },
  {
    id: 'rec-2',
    title: 'Sewa Ruang Kerja / Kantor',
    type: 'outflow',
    amount: 3500000,
    category: 'Tempat Tinggal',
    account: 'Operating Account',
    frequency: 'monthly',
    nextDueDate: '2026-10-02',
    autoRecord: true,
    currency: 'IDR',
  },
  {
    id: 'rec-3',
    title: 'Tagihan Internet & Utilities',
    type: 'outflow',
    amount: 775000,
    category: 'Tagihan',
    account: 'Checking Account',
    frequency: 'monthly',
    nextDueDate: '2026-09-24',
    autoRecord: true,
    currency: 'IDR',
  },
  {
    id: 'rec-4',
    title: 'Langganan Software & Cloud Tools ($50 USD)',
    type: 'outflow',
    amount: 815000,
    category: 'Software & SaaS',
    account: 'Credit Card',
    frequency: 'monthly',
    nextDueDate: '2026-10-06',
    autoRecord: false,
    currency: 'IDR',
  }
];

// Default Public Supabase Credentials
export const DEFAULT_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhgfyzqzcyoprtnyikhx.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gggCxqbF1fPHM92bAvDhSg_8fG8rL32';

// Helper to get active Supabase credentials
export function getSupabaseCredentials(): { url: string; key: string; isConfigured: boolean; source: 'default' | 'env' } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = (envUrl && envUrl.trim()) ? envUrl.trim() : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhgfyzqzcyoprtnyikhx.supabase.co');
  const key = (envKey && envKey.trim()) ? envKey.trim() : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gggCxqbF1fPHM92bAvDhSg_8fG8rL32');

  return {
    url,
    key,
    isConfigured: true,
    source: envUrl ? 'env' : 'default',
  };
}

// Client singleton initialized with default public credentials
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const isBrowser = typeof window !== 'undefined';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhgfyzqzcyoprtnyikhx.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gggCxqbF1fPHM92bAvDhSg_8fG8rL32';

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: isBrowser,
          autoRefreshToken: isBrowser,
          detectSessionInUrl: isBrowser,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client with standard options, using safe fallback:', err);
      try {
        supabaseInstance = createClient(
          'https://rhgfyzqzcyoprtnyikhx.supabase.co',
          'sb_publishable_gggCxqbF1fPHM92bAvDhSg_8fG8rL32',
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
        );
      } catch (fallbackErr) {
        console.error('Critical fallback client creation error:', fallbackErr);
      }
    }
  }
  return supabaseInstance!;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      const client = getSupabaseClient();
      if (!client) return undefined;
      const val = (client as any)[prop];
      if (typeof val === 'function') {
        return val.bind(client);
      }
      return val;
    } catch (err) {
      console.warn(`Supabase proxy access error on property "${String(prop)}":`, err);
      return undefined;
    }
  },
});

export function saveCustomSupabaseCredentials(_url: string, _key: string) {
  // Maintained for backward compatibility, credentials are now hardcoded and connected permanently
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { success: true, message: 'Server environment active' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase credentials not configured' };
  }
  try {
    const { error } = await client.from('cashflow_transactions').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but "cashflow_transactions" table was not found. Please execute the setup SQL schema.',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully!' };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Unknown connection error' };
  }
}

// ----------------------------------------------------
// SUPABASE AUTHENTICATION HELPERS
// ----------------------------------------------------

function mapSupabaseUserToProfile(user?: any | null): UserProfile {
  if (!user) {
    return {
      id: '',
      email: '',
      fullName: 'User',
    };
  }
  const email = user?.email || '';
  const fullName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (email ? email.split('@')?.[0] : '') ||
    'User';

  return {
    id: user?.id || '',
    email,
    fullName,
  };
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;
  try {
    const client = getSupabaseClient();
    if (!client || !client.auth) return null;

    const { data, error } = await client.auth.getSession();
    if (error) {
      console.warn('Supabase getSession returned error:', error?.message);
      return null;
    }
    const session = data?.session;
    if (!session?.user) return null;
    return mapSupabaseUserToProfile(session.user);
  } catch (err) {
    console.warn('Safely caught error in getCurrentUser:', err);
    return null;
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      error: 'Supabase belum dikonfigurasi. Silakan masukkan Supabase URL & Anon Key di pengaturan.',
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'User tidak ditemukan.' };
    }

    return { user: mapSupabaseUserToProfile(data.user), error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Gagal melakukan login.',
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      error: 'Supabase belum dikonfigurasi. Silakan masukkan Supabase URL & Anon Key di pengaturan.',
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const user = mapSupabaseUserToProfile(data.user);
      // In Supabase, if email confirmation is enabled, session might be null until confirmed
      const confirmationRequired = !data.session;
      return { user, error: null, confirmationRequired };
    }

    return { user: null, error: 'Pendaftaran gagal.' };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Gagal mendaftar akun.',
    };
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  try {
    const { error } = await client.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Gagal keluar akun.',
    };
  }
}

export async function resetPasswordForEmail(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase belum dikonfigurasi. Silakan masukkan Supabase URL & Anon Key di pengaturan.',
    };
  }

  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengirim email pemulihan kata sandi.',
    };
  }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Gagal masuk dengan Google.',
    };
  }
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ data: any; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase belum dikonfigurasi. Silakan masukkan Supabase URL & Anon Key di pengaturan.' };
  }

  try {
    const { data, error } = await client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.',
    };
  }
}

/**
 * Checks if the current browser URL contains Supabase password recovery parameters
 * (e.g. #access_token=...&type=recovery or ?type=recovery or PKCE recovery callback)
 */
export function isPasswordRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // Check hash parameters (#access_token=...&type=recovery)
    if (hash) {
      const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
      const hashParams = new URLSearchParams(cleanHash);
      if (hashParams.get('type') === 'recovery') return true;
    }

    // Check search parameters (?type=recovery)
    if (search) {
      const searchParams = new URLSearchParams(search);
      if (searchParams.get('type') === 'recovery') return true;
    }

    // Direct fallback check
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      return true;
    }
  } catch (err) {
    console.warn('Error reading URL for recovery params:', err);
  }
  return false;
}

/**
 * Checks if URL hash contains an auth error like expired or invalid recovery link
 */
export function getRecoveryErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const searchParams = new URLSearchParams(search);
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    if (errorDesc) return decodeURIComponent(errorDesc.replace(/\+/g, ' '));
    const error = hashParams.get('error') || searchParams.get('error');
    if (error) return error;
  } catch (err) {
    console.warn('Error reading recovery error from URL:', err);
  }
  return null;
}

/**
 * Cleans the recovery hash/query from the browser URL without a full page refresh
 */
export function clearRecoveryUrlParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, '', cleanUrl);
  } catch (err) {
    console.warn('Failed to clean recovery URL hash:', err);
  }
}

export function subscribeToAuthChanges(
  callback: (user: UserProfile | null, event?: string, session?: any) => void,
  onPasswordRecovery?: () => void
) {
  if (typeof window === 'undefined') return () => {};
  try {
    const client = getSupabaseClient();
    if (!client || !client.auth) return () => {};

    const { data } = client.auth.onAuthStateChange((event, session) => {
      try {
        if (event === 'PASSWORD_RECOVERY') {
          if (onPasswordRecovery) {
            onPasswordRecovery();
          }
        }
        if (session?.user) {
          callback(mapSupabaseUserToProfile(session.user), event, session);
        } else {
          callback(null, event, session);
        }
      } catch (err) {
        console.warn('Error handling auth state change in listener:', err);
        callback(null, event);
      }
    });

    return () => {
      try {
        data?.subscription?.unsubscribe();
      } catch {
        // Safe unsubscribe
      }
    };
  } catch (err) {
    console.warn('Safely caught error setting up auth listener in subscribeToAuthChanges:', err);
    return () => {};
  }
}

// ----------------------------------------------------
// USER-SCOPED LOCAL STORAGE HANDLERS
// ----------------------------------------------------

function getTxStorageKey(userId?: string): string {
  return userId ? `${LOCAL_TRANSACTIONS_KEY}_${userId}` : `${LOCAL_TRANSACTIONS_KEY}_guest`;
}

function getRecStorageKey(userId?: string): string {
  return userId ? `${LOCAL_RECURRING_KEY}_${userId}` : `${LOCAL_RECURRING_KEY}_guest`;
}

export function getLocalTransactions(userId?: string): Transaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const key = getTxStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) {
    // Seed initial demo data for this profile
    const seeded = INITIAL_TRANSACTIONS.map((t) => ({ ...t, userId }));
    try {
      localStorage.setItem(key, JSON.stringify(seeded));
    } catch {
      // ignore
    }
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveLocalTransactions(txs: Transaction[], userId?: string) {
  if (typeof window !== 'undefined') {
    const key = getTxStorageKey(userId);
    try {
      const safeTxs = Array.isArray(txs) ? txs : [];
      localStorage.setItem(key, JSON.stringify(safeTxs));
    } catch {
      // ignore
    }
  }
}

export function getLocalRecurring(userId?: string): RecurringBill[] {
  if (typeof window === 'undefined') return INITIAL_RECURRING;
  const key = getRecStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) {
    const seeded = INITIAL_RECURRING.map((r) => ({ ...r, userId }));
    try {
      localStorage.setItem(key, JSON.stringify(seeded));
    } catch {
      // ignore
    }
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_RECURRING;
  } catch {
    return INITIAL_RECURRING;
  }
}

export function saveLocalRecurring(bills: RecurringBill[], userId?: string) {
  if (typeof window !== 'undefined') {
    const key = getRecStorageKey(userId);
    try {
      const safeBills = Array.isArray(bills) ? bills : [];
      localStorage.setItem(key, JSON.stringify(safeBills));
    } catch {
      // ignore
    }
  }
}

// ----------------------------------------------------
// SUPABASE USER-SCOPED DATA SYNC API
// ----------------------------------------------------

export async function fetchUserTransactionsFromSupabase(userId: string): Promise<{ data: Transaction[] | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase client not configured' };

  try {
    const { data, error } = await client
      .from('cashflow_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) return { data: null, error: error.message };

    // Format fields
    const mapped: Transaction[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: Number(row.amount),
      description: row.description,
      category: row.category,
      account: row.account,
      date: row.date,
      notes: row.notes,
      isRecurring: row.is_recurring,
      recurringId: row.recurring_id,
      currency: row.currency || 'IDR',
      originalAmount: row.original_amount ? Number(row.original_amount) : undefined,
      exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : undefined,
      baseCurrency: row.base_currency || 'IDR',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch transactions' };
  }
}

export async function upsertUserTransactionsToSupabase(txs: Transaction[], userId: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  try {
    const rows = txs.map((t) => ({
      id: t.id,
      user_id: userId,
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: t.category,
      account: t.account,
      date: t.date,
      notes: t.notes || null,
      is_recurring: !!t.isRecurring,
      recurring_id: t.recurringId || null,
      currency: t.currency || 'IDR',
      original_amount: t.originalAmount || null,
      exchange_rate: t.exchangeRate || null,
      base_currency: t.baseCurrency || 'IDR',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('cashflow_transactions').upsert(rows, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error syncing transactions' };
  }
}

export async function deleteTransactionFromSupabase(id: string, userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('cashflow_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchUserRecurringFromSupabase(userId: string): Promise<{ data: RecurringBill[] | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase client not configured' };

  try {
    const { data, error } = await client
      .from('cashflow_recurring')
      .select('*')
      .eq('user_id', userId)
      .order('next_due_date', { ascending: true });

    if (error) return { data: null, error: error.message };

    const mapped: RecurringBill[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      type: row.type,
      amount: Number(row.amount),
      category: row.category,
      account: row.account,
      frequency: row.frequency,
      nextDueDate: row.next_due_date,
      autoRecord: row.auto_record,
      lastPaidDate: row.last_paid_date,
      notes: row.notes,
      currency: row.currency || 'IDR',
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch recurring' };
  }
}

export async function upsertUserRecurringToSupabase(bills: RecurringBill[], userId: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase not configured' };

  try {
    const rows = bills.map((b) => ({
      id: b.id,
      user_id: userId,
      title: b.title,
      type: b.type,
      amount: b.amount,
      category: b.category,
      account: b.account,
      frequency: b.frequency,
      next_due_date: b.nextDueDate,
      auto_record: !!b.autoRecord,
      last_paid_date: b.lastPaidDate || null,
      notes: b.notes || null,
      currency: b.currency || 'IDR',
    }));

    const { error } = await client.from('cashflow_recurring').upsert(rows, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error syncing recurring' };
  }
}

export async function deleteRecurringFromSupabase(id: string, userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('cashflow_recurring')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}

export const getSupabaseUser = getCurrentUser;

export async function fetchUserTransactions(userId: string): Promise<Transaction[]> {
  const res = await fetchUserTransactionsFromSupabase(userId);
  return res.data || [];
}

export async function fetchUserRecurring(userId: string): Promise<RecurringBill[]> {
  const res = await fetchUserRecurringFromSupabase(userId);
  return res.data || [];
}

export async function upsertUserTransaction(tx: Transaction, userId?: string) {
  if (!userId) {
    const client = getSupabaseClient();
    if (client) {
      await client.from('cashflow_transactions').upsert({
        id: tx.id,
        user_id: null,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        account: tx.account,
        date: tx.date,
        is_recurring: tx.isRecurring,
        currency: tx.currency || 'IDR',
        original_amount: tx.originalAmount,
        exchange_rate: tx.exchangeRate,
        base_currency: tx.baseCurrency || 'IDR',
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }
  return upsertUserTransactionsToSupabase([tx], userId);
}

export async function deleteUserTransaction(id: string, userId?: string) {
  if (userId) {
    return deleteTransactionFromSupabase(id, userId);
  }
  const client = getSupabaseClient();
  if (client) {
    await client.from('cashflow_transactions').delete().eq('id', id);
  }
}

export async function upsertUserRecurring(bill: RecurringBill, userId?: string) {
  if (!userId) {
    const client = getSupabaseClient();
    if (client) {
      await client.from('cashflow_recurring').upsert({
        id: bill.id,
        user_id: null,
        title: bill.title,
        type: bill.type,
        amount: bill.amount,
        category: bill.category,
        account: bill.account,
        frequency: bill.frequency,
        next_due_date: bill.nextDueDate,
        auto_record: bill.autoRecord,
        currency: bill.currency || 'IDR',
      });
    }
    return;
  }
  return upsertUserRecurringToSupabase([bill], userId);
}

export async function deleteUserRecurring(id: string, userId?: string) {
  if (userId) {
    return deleteRecurringFromSupabase(id, userId);
  }
  const client = getSupabaseClient();
  if (client) {
    await client.from('cashflow_recurring').delete().eq('id', id);
  }
}

// ----------------------------------------------------
// SUPABASE SQL SCHEMA FOR USER-SCOPED SUPABASE AUTH & RLS
// ----------------------------------------------------
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- CASHFLOW TRACKER SUPABASE SCHEMA (USER-SCOPED)
-- Supports Supabase Auth & Multi-User Isolation
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Transactions Table with user_id
CREATE TABLE IF NOT EXISTS public.cashflow_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
  amount NUMERIC(14, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_id TEXT,
  currency TEXT DEFAULT 'IDR',
  original_amount NUMERIC(14, 2),
  exchange_rate NUMERIC(14, 4),
  base_currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration safety: Add user_id column if table already exists without it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cashflow_transactions' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.cashflow_transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Create Recurring Cashflows Table with user_id
CREATE TABLE IF NOT EXISTS public.cashflow_recurring (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
  amount NUMERIC(14, 2) NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  frequency TEXT NOT NULL,
  next_due_date DATE NOT NULL,
  auto_record BOOLEAN DEFAULT FALSE,
  last_paid_date DATE,
  notes TEXT,
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration safety: Add user_id column to recurring if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cashflow_recurring' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.cashflow_recurring ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Indexes for fast per-user timeline querying
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.cashflow_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.cashflow_transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_recurring_user_due ON public.cashflow_recurring(user_id, next_due_date ASC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.cashflow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_recurring ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies if any
DROP POLICY IF EXISTS "Allow public read-write for cashflow transactions" ON public.cashflow_transactions;
DROP POLICY IF EXISTS "Allow public read-write for cashflow recurring" ON public.cashflow_recurring;
DROP POLICY IF EXISTS "Users can only select own transactions" ON public.cashflow_transactions;
DROP POLICY IF EXISTS "Users can only insert own transactions" ON public.cashflow_transactions;
DROP POLICY IF EXISTS "Users can only update own transactions" ON public.cashflow_transactions;
DROP POLICY IF EXISTS "Users can only delete own transactions" ON public.cashflow_transactions;
DROP POLICY IF EXISTS "Users can only select own recurring" ON public.cashflow_recurring;
DROP POLICY IF EXISTS "Users can only insert own recurring" ON public.cashflow_recurring;
DROP POLICY IF EXISTS "Users can only update own recurring" ON public.cashflow_recurring;
DROP POLICY IF EXISTS "Users can only delete own recurring" ON public.cashflow_recurring;

-- 6. Strictly Secure Row-Level Security: Only authenticated users can access their own data
CREATE POLICY "Users can only select own transactions"
ON public.cashflow_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own transactions"
ON public.cashflow_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own transactions"
ON public.cashflow_transactions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own transactions"
ON public.cashflow_transactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only select own recurring"
ON public.cashflow_recurring FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own recurring"
ON public.cashflow_recurring FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own recurring"
ON public.cashflow_recurring FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own recurring"
ON public.cashflow_recurring FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
`;
