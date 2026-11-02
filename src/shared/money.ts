import type { CountryCode } from './country/types';

/**
 * Tu Turno — Money formatting
 *
 * Every amount the user reads passes through here. Before this file the symbol
 * was typed by hand in thirty-odd places, which is why changing currency used
 * to mean touching thirty-odd files and hoping none were missed.
 *
 * Transactions supply their currency; shared country configuration provides the fallback.
 */

/** The symbol shown to the user. Country parameter, not a design choice. */
export interface CurrencyConfig {
  code: string;
  locale: string;
  display?: 'narrowSymbol' | 'code';
}

/** Match this checkout's existing SAN currency; supplied SAN currency takes priority. */
export const DEFAULT_CURRENCY: CurrencyConfig = { code: 'EUR', locale: 'es-VE' };

/** Stable legacy labels across Hermes and browser Intl implementations. */
const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', COP: 'COP' };
const SYMBOL = CURRENCY_SYMBOLS[DEFAULT_CURRENCY.code] ?? DEFAULT_CURRENCY.code;

/**
 * A whole amount: €100. Used for SAN sizes, payouts and tier ceilings, which
 * are always round numbers by product rule.
 */
export function money(amount: number): string {
  return `${SYMBOL}${amount}`;
}

/**
 * An exact amount with cents: €11,74. Used wherever the figure is a real
 * charge the user is about to transfer, where rounding would be a lie.
 *
 * The decimal separator is a comma, which is what a Venezuelan reader expects
 * and what their banking app shows them.
 */
export function moneyExact(amount: number): string {
  return `${SYMBOL}${amount.toFixed(2).replace('.', ',')}`;
}

/** The bare symbol, for the few places that compose their own string. */
export const CURRENCY_SYMBOL = SYMBOL;

/** Referral display follows the November cash-program brief, independently of SAN pricing. */
export function referralMoney(
  amount: number,
  country: CountryCode,
  display: 'symbol' | 'code' = 'symbol',
): string {
  const number = new Intl.NumberFormat(country === 'VE' ? 'es-VE' : 'es-CO', {
    maximumFractionDigits: 2,
  }).format(amount);
  return country === 'VE' ? `${number}${display === 'code' ? ' USD' : '$'}` : `${number} pesos`;
}

export function countryMoney(
  amount: number,
  config: CurrencyConfig,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    currencyDisplay: config.display ?? 'narrowSymbol',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : maximumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}
