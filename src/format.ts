/**
 * Formatting functions for monetary amounts and percentages
 * 
 * This module provides functions to format monetary amounts and percentages
 * for display purposes while maintaining precision.
 */

import type { AmountCents } from './types.ts';
import { validateIntegerForFormatting, validateNumberForFormatting } from './validation.ts';
import { CENTS_SCALE, DEFAULT_CURRENCY_SYMBOL, DEFAULT_LOCALE } from './constants.ts';

/**
 * Format cents to number with exactly 2 decimal places
 * 
 * @param cents - Amount in cents (integer, can be negative)
 * @returns Number with exactly 2 decimal places
 * @throws Error if cents is not a valid integer
 * 
 * @example
 * formatCentsToNumber(12345) // returns 123.45
 * formatCentsToNumber(100) // returns 1.00
 * formatCentsToNumber(0) // returns 0.00
 * formatCentsToNumber(-12345) // returns -123.45
 */
export function formatCentsToNumber(cents: AmountCents): number {
  const validCents = validateIntegerForFormatting(cents, 'Amount in cents');
  const result = validCents / CENTS_SCALE;
  
  // Ensure exactly 2 decimal places by rounding to avoid floating point issues
  return Math.round(result * 100) / 100;
}

/**
 * Format percentage to number with 2 decimal precision
 * 
 * @param percent - Percentage value (can be 0-1 or 0-100 range, can be negative)
 * @returns Number with exactly 2 decimal places
 * @throws Error if percent is not a valid number
 * 
 * @example
 * formatPercentToNumber(13.456) // returns 13.46
 * formatPercentToNumber(0.13456) // returns 0.13
 * formatPercentToNumber(100) // returns 100.00
 * formatPercentToNumber(-13.456) // returns -13.46
 */
export function formatPercentToNumber(percent: number): number {
  const validPercent = validateNumberForFormatting(percent, 'Percent');
  
  // Round to 2 decimal places
  return Math.round(validPercent * 100) / 100;
}

/**
 * Format cents with currency symbol using locale-specific formatting
 * 
 * @param cents - Amount in cents (integer, can be negative)
 * @param currencySymbol - Currency symbol to use (default: '$')
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted currency string
 * @throws Error if cents is not a valid integer
 * 
 * @example
 * formatCentsWithCurrency(12345) // returns '$123.45'
 * formatCentsWithCurrency(12345, '€', 'de-DE') // returns '€123,45'
 * formatCentsWithCurrency(1000000, '¥', 'ja-JP') // returns '¥10,000.00'
 * formatCentsWithCurrency(-12345) // returns '$-123.45'
 */
export function formatCentsWithCurrency(
  cents: AmountCents,
  currencySymbol: string = DEFAULT_CURRENCY_SYMBOL,
  locale: string = DEFAULT_LOCALE
): string {
  const validCents = validateIntegerForFormatting(cents, 'Amount in cents');
  const decimalAmount = validCents / CENTS_SCALE;
  
  // Use Intl.NumberFormat for locale-specific formatting
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedNumber = formatter.format(decimalAmount);
  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Format percentage with % symbol at the end
 * 
 * @param percent - Percentage value (any numeric range)
 * @returns Formatted percentage string with % symbol
 * @throws Error if percent is not a valid number
 * 
 * @example
 * formatPercentWithSymbol(13.456) // returns '13.46%'
 * formatPercentWithSymbol(0.13) // returns '0.13%'
 * formatPercentWithSymbol(100) // returns '100.00%'
 */
export function formatPercentWithSymbol(percent: number): string {
  const formattedPercent = formatPercentToNumber(percent);
  return `${formattedPercent.toFixed(2)}%`;
}

/**
 * Clamp percentage value to 0-1 range
 * 
 * @param percent - Percentage value to clamp (can be negative)
 * @returns Percentage clamped between 0 and 1
 * @throws Error if percent is not a valid number
 * 
 * @example
 * clampPercent01(0.5) // returns 0.5
 * clampPercent01(-0.1) // returns 0
 * clampPercent01(1.5) // returns 1
 */
export function clampPercent01(percent: number): number {
  const validPercent = validateNumberForFormatting(percent, 'Percent');
  return Math.max(0, Math.min(1, validPercent));
}

/**
 * Clamp percentage value to 0-100 range
 * 
 * @param percent - Percentage value to clamp (can be negative)
 * @returns Percentage clamped between 0 and 100
 * @throws Error if percent is not a valid number
 * 
 * @example
 * clampPercent0100(50) // returns 50
 * clampPercent0100(-10) // returns 0
 * clampPercent0100(150) // returns 100
 */
export function clampPercent0100(percent: number): number {
  const validPercent = validateNumberForFormatting(percent, 'Percent');
  return Math.max(0, Math.min(100, validPercent));
}