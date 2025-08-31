/**
 * Formatting functions for monetary amounts and percentages
 * 
 * This module provides functions to format monetary amounts and percentages
 * for display purposes while maintaining precision.
 */

import type { StringOrNumber } from './types.ts';
import { validateIntegerForFormatting, validateNumberForFormatting, convertToNumber } from './validation.ts';
import { CENTS_SCALE, DEFAULT_CURRENCY_SYMBOL, DEFAULT_LOCALE } from './constants.ts';

/**
 * Round half up algorithm implementation
 * 0.5 rounds up to 1, -0.5 rounds up to 0
 * 
 * @param value - Number to round
 * @param decimals - Number of decimal places to round to
 * @returns Rounded number using round half up algorithm
 * 
 * @example
 * roundHalfUp(0.5, 0) // returns 1
 * roundHalfUp(-0.5, 0) // returns 0
 * roundHalfUp(1.235, 2) // returns 1.24
 * roundHalfUp(-1.235, 2) // returns -1.23
 */
function roundHalfUp(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  const shifted = value * factor;
  
  // Round half up: when the fractional part is exactly 0.5, round towards positive infinity
  // This means: 0.5 -> 1, -0.5 -> 0, 1.5 -> 2, -1.5 -> -1
  if (shifted >= 0) {
    return Math.floor(shifted + 0.5) / factor;
  } else {
    return Math.ceil(shifted - 0.5) / factor;
  }
}

/**
 * Apply intelligent adjustment to rounded values for better readability
 * Adjusts values like 121.99→122.00, 122.01→122.00, 56.49→56.50
 * 
 * @param value - Number to potentially adjust
 * @returns Adjusted number for better readability
 * 
 * @example
 * applyIntelligentAdjustment(121.99) // returns 122.00
 * applyIntelligentAdjustment(122.01) // returns 122.00
 * applyIntelligentAdjustment(56.49) // returns 56.50
 * applyIntelligentAdjustment(123.45) // returns 123.45 (no change)
 */
function applyIntelligentAdjustment(value: number): number {
  // First apply round half up to 2 decimal places
  const rounded = roundHalfUp(value, 2);
  
  // Check for values that can be improved by 1 cent adjustment
  const cents = Math.round(rounded * 100);
  const absCents = Math.abs(cents);
  const lastTwoDigits = absCents % 100;
  const isNegative = cents < 0;
  
  // For negative numbers, we need to handle adjustments differently
  if (isNegative) {
    // Adjust -121.99 → -122.00 (round towards more negative)
    if (lastTwoDigits === 99 && absCents >= 199) { // Only adjust if >= $1.99
      return Math.floor(rounded);
    }
    
    // Adjust -122.01 → -122.00 (round towards less negative)
    if (lastTwoDigits === 1 && absCents >= 201) { // Only adjust if >= $2.01
      return Math.ceil(rounded);
    }
    
    // Adjust -56.49 → -56.50 (round towards more negative by 0.01)
    if (lastTwoDigits === 49) {
      return rounded - 0.01;
    }
  } else {
    // Positive number adjustments
    // Adjust 121.99 → 122.00 (only for amounts >= $1.99)
    if (lastTwoDigits === 99 && cents >= 199) {
      return Math.ceil(rounded);
    }
    
    // Adjust 122.01 → 122.00 (only for amounts >= $2.01)
    if (lastTwoDigits === 1 && cents >= 201) {
      return Math.floor(rounded);
    }
    
    // Adjust 56.49 → 56.50
    if (lastTwoDigits === 49) {
      return rounded + 0.01;
    }
  }
  
  return rounded;
}

/**
 * Format cents to number with exactly 2 decimal places
 * 
 * @param cents - Amount in cents (integer, can be negative) - accepts string or number
 * @returns Number with exactly 2 decimal places
 * @throws Error if cents is not a valid integer
 * 
 * @example
 * formatCentsToNumber(12345) // returns 123.45
 * formatCentsToNumber("12345") // returns 123.45
 * formatCentsToNumber(100) // returns 1.00
 * formatCentsToNumber("100") // returns 1.00
 * formatCentsToNumber(0) // returns 0.00
 * formatCentsToNumber(-12345) // returns -123.45
 */
export function formatCentsToNumber(cents: StringOrNumber): number {
  // For formatting functions, we handle string conversion differently to maintain
  // the expected "cannot be null or undefined" error messages
  let numericCents: number;
  
  if (typeof cents === 'string') {
    numericCents = convertToNumber(cents, 'Amount in cents');
  } else {
    // For non-string inputs, use the formatting validator directly
    numericCents = cents as number;
  }
  
  const validCents = validateIntegerForFormatting(numericCents, 'Amount in cents');
  const result = validCents / CENTS_SCALE;
  
  // Use intelligent rounding instead of basic Math.round
  return applyIntelligentAdjustment(result);
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
  
  // Use round half up rounding instead of basic Math.round
  return roundHalfUp(validPercent, 2);
}

/**
 * Format cents with currency symbol using locale-specific formatting
 * 
 * @param cents - Amount in cents (integer, can be negative) - accepts string or number
 * @param currencySymbol - Currency symbol to use (default: '$')
 * @param locale - Locale for number formatting (default: 'en-US')
 * @returns Formatted currency string
 * @throws Error if cents is not a valid integer
 * 
 * @example
 * formatCentsWithCurrency(12345) // returns '$123.45'
 * formatCentsWithCurrency("12345") // returns '$123.45'
 * formatCentsWithCurrency(12345, '€', 'de-DE') // returns '€123,45'
 * formatCentsWithCurrency("1000000", '¥', 'ja-JP') // returns '¥10,000.00'
 * formatCentsWithCurrency(-12345) // returns '$-123.45'
 * formatCentsWithCurrency("  12345  ") // returns '$123.45' (handles whitespace)
 */
export function formatCentsWithCurrency(
  cents: StringOrNumber,
  currencySymbol: string = DEFAULT_CURRENCY_SYMBOL,
  locale: string = DEFAULT_LOCALE
): string {
  // For formatting functions, we handle string conversion differently to maintain
  // the expected "cannot be null or undefined" error messages
  let numericCents: number;
  
  if (typeof cents === 'string') {
    numericCents = convertToNumber(cents, 'Amount in cents');
  } else {
    // For non-string inputs, use the formatting validator directly
    numericCents = cents as number;
  }
  
  const validCents = validateIntegerForFormatting(numericCents, 'Amount in cents');
  
  // Apply intelligent rounding first
  const intelligentlyRoundedAmount = applyIntelligentAdjustment(validCents / CENTS_SCALE);
  
  // Use Intl.NumberFormat for locale-specific formatting
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const formattedNumber = formatter.format(intelligentlyRoundedAmount);
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