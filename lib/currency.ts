// Currency conversion and formatting utility
import { CurrencyInfo } from './types';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Rupiah Indonesia',
    flag: '🇮🇩',
    locale: 'id-ID',
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    locale: 'en-US',
    decimals: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    locale: 'en-SG',
    decimals: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    flag: '🇲🇾',
    locale: 'ms-MY',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    locale: 'ja-JP',
    decimals: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    locale: 'de-DE',
    decimals: 2,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    locale: 'th-TH',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    locale: 'en-AU',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    locale: 'en-GB',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SR',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    locale: 'ar-SA',
    decimals: 2,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    locale: 'zh-CN',
    decimals: 2,
  },
};

// Default fallback exchange rates against 1 USD
export const DEFAULT_USD_RATES: Record<string, number> = {
  USD: 1,
  IDR: 16300,
  SGD: 1.31,
  MYR: 4.35,
  JPY: 152.5,
  EUR: 0.92,
  THB: 34.5,
  AUD: 1.52,
  GBP: 0.78,
  SAR: 3.75,
  CNY: 7.15,
};

const CACHED_RATES_KEY = 'cashflow_cached_exchange_rates_v1';
const BASE_CURRENCY_KEY = 'cashflow_base_currency_v1';

// Get base currency from localStorage (default: MYR)
export function getStoredBaseCurrency(): string {
  if (typeof window === 'undefined') return 'MYR';
  try {
    const stored = localStorage.getItem(BASE_CURRENCY_KEY);
    if (stored && SUPPORTED_CURRENCIES[stored]) {
      return stored;
    }
  } catch {
    // fallback
  }
  return 'MYR';
}

export function setStoredBaseCurrency(currencyCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (SUPPORTED_CURRENCIES[currencyCode]) {
      localStorage.setItem(BASE_CURRENCY_KEY, currencyCode);
      window.dispatchEvent(new Event('baseCurrencyChanged'));
    }
  } catch {
    // ignore
  }
}

// Get cached exchange rates (relative to USD)
export function getExchangeRates(): Record<string, number> {
  if (typeof window === 'undefined') return DEFAULT_USD_RATES;
  try {
    const raw = localStorage.getItem(CACHED_RATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.rates === 'object' && parsed.rates.IDR) {
        return { ...DEFAULT_USD_RATES, ...parsed.rates };
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_USD_RATES;
}

// Fetch fresh exchange rates in background
export async function refreshLiveExchangeRates(): Promise<{ success: boolean; date?: string }> {
  if (typeof window === 'undefined') {
    return { success: false };
  }
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();
    if (data && data.rates && data.rates.IDR) {
      const filteredRates: Record<string, number> = {};
      Object.keys(SUPPORTED_CURRENCIES).forEach((code) => {
        if (data.rates[code]) {
          filteredRates[code] = data.rates[code];
        }
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          CACHED_RATES_KEY,
          JSON.stringify({
            rates: filteredRates,
            updatedAt: new Date().toISOString(),
          })
        );
        window.dispatchEvent(new Event('exchangeRatesUpdated'));
      }
      return { success: true, date: data.time_last_update_utc };
    }
  } catch (err) {
    console.warn('Could not fetch live exchange rates, using local fallback:', err);
  }
  return { success: false };
}

/**
 * Calculates how much 1 unit of `fromCurrency` is worth in `toCurrency`.
 * e.g., getRate('USD', 'IDR') returns ~16300 (1 USD = 16.300 IDR)
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;
  const rates = getExchangeRates();
  const fromUsd = rates[fromCurrency] || DEFAULT_USD_RATES[fromCurrency] || 1;
  const toUsd = rates[toCurrency] || DEFAULT_USD_RATES[toCurrency] || 1;

  // Since rates are expressed as: 1 USD = rates[CURR] units of CURR
  // 1 unit of fromCurrency = (1 / fromUsd) USD = (toUsd / fromUsd) units of toCurrency
  const rate = toUsd / fromUsd;
  return rate;
}

/**
 * Converts an amount from `fromCurrency` to `toCurrency`
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  customRate?: number
): number {
  if (fromCurrency === toCurrency) return amount;
  const rate = customRate !== undefined && customRate > 0 
    ? customRate 
    : getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Formats a currency value with proper Indonesian (or foreign) localized symbols & separators.
 * For IDR: e.g. "Rp 150.000" or "-Rp 25.000" or "+Rp 1.500.000"
 * For USD: e.g. "$150.00" or "-$25.00"
 */
export function formatCurrency(
  value?: number | null,
  currencyCode = 'IDR',
  options?: {
    includeSign?: boolean;
    hideDecimals?: boolean;
    compact?: boolean;
  }
): string {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : 0;
  const info = (currencyCode && SUPPORTED_CURRENCIES[currencyCode]) || SUPPORTED_CURRENCIES.IDR;
  const isNegative = safeVal < 0;
  const absVal = Math.abs(safeVal);

  let formattedNumber = '';

  if (options?.compact && absVal >= 1_000_000_000) {
    formattedNumber = (absVal / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
  } else if (options?.compact && absVal >= 1_000_000) {
    formattedNumber = (absVal / 1_000_000).toFixed(1).replace(/\.0$/, '') + (info.code === 'IDR' ? ' jt' : ' M');
  } else if (options?.compact && absVal >= 1_000 && info.code === 'IDR') {
    formattedNumber = (absVal / 1_000).toFixed(0) + ' rb';
  } else {
    // Standard locale formatting
    const decimals = options?.hideDecimals || info.decimals === 0 
      ? 0 
      : (absVal % 1 === 0 ? 0 : info.decimals);

    formattedNumber = absVal.toLocaleString(info.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Symbol placement
  let result = '';
  if (info.code === 'IDR') {
    result = `Rp ${formattedNumber}`;
  } else if (info.code === 'SGD') {
    result = `S$ ${formattedNumber}`;
  } else if (info.code === 'MYR') {
    result = `RM ${formattedNumber}`;
  } else if (info.code === 'AUD') {
    result = `A$ ${formattedNumber}`;
  } else {
    result = `${info.symbol}${formattedNumber}`;
  }

  if (options?.includeSign) {
    if (isNegative) return `-${result}`;
    if (safeVal > 0) return `+${result}`;
    return result;
  }

  return isNegative ? `-${result}` : result;
}
