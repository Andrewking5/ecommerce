/**
 * Multi-currency support utility.
 *
 * Currently the store operates in TWD. This module provides a centralized
 * formatter so switching currencies or adding new ones requires changes
 * in only one place.
 */

export type CurrencyCode = 'TWD' | 'USD' | 'JPY';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  rate: number; // Relative to TWD (base = 1)
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  TWD: { code: 'TWD', symbol: 'NT$', locale: 'zh-TW', rate: 1 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', rate: 0.031 },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', rate: 4.7 },
};

// Default currency — read from localStorage or default to TWD
export function getActiveCurrency(): CurrencyCode {
  const stored = localStorage.getItem('currency');
  if (stored && stored in CURRENCIES) return stored as CurrencyCode;
  return 'TWD';
}

export function setActiveCurrency(code: CurrencyCode) {
  localStorage.setItem('currency', code);
  window.dispatchEvent(new Event('currency-changed'));
}

export function getSupportedCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Format a TWD price into the active (or specified) currency.
 */
export function formatPrice(twdAmount: number, currency?: CurrencyCode): string {
  const code = currency || getActiveCurrency();
  const config = CURRENCIES[code];
  const converted = twdAmount * config.rate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: code === 'JPY' ? 0 : 0,
    maximumFractionDigits: code === 'JPY' ? 0 : code === 'TWD' ? 0 : 2,
  }).format(converted);
}
